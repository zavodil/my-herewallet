import BN from "bn.js";
import { JsonRpcProvider, TypedError } from "near-api-js/lib/providers";
import { base_decode, base_encode, serialize } from "near-api-js/lib/utils/serialize";
import { Action, HereCall, SignMessageOptionsNEP0413, createAction } from "@here-wallet/core";
import { AccessKeyView, AccessKeyViewRaw, FinalExecutionOutcome } from "near-api-js/lib/providers/provider";
import { Account, Connection, InMemorySigner, KeyPair, Signer, providers, transactions } from "near-api-js";
import { authPayloadSchema } from "@here-wallet/core/src/nep0314";
import { ChangeFunctionCallOptions, SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { encodeDelegateAction, buildDelegateAction, signDelegateAction } from "@near-js/transactions";
import { EventEmitter, Transaction } from "@near-wallet-selector/core";
import { PublicKey } from "near-api-js/lib/utils";
import { NearSnapAccount } from "@near-snap/sdk";
import * as ref from "@ref-finance/ref-sdk";

import { near, testnetNear } from "../token/defaults";
import { Chain, FtModel } from "../token/types";
import { chunk, parseAmount } from "../helpers";
import { NETWORK, TGAS } from "../constants";

import { ConnectType } from "../types";
import NearApi, { DelegateNotAllowed, NearAccessKey } from "../network/near";
import { TransactionError } from "../network/types";
import { HereApi, NetworkError } from "../network/api";
import { GAME_ID, GAME_TESTNET_ID } from "../Hot";

import { accounts } from "../Accounts";

import { NOT_STAKABLE_NEAR, getHereStorage, getNodeUrl, getWrapNear } from "./constants";
import { SAFE_NEAR, actionsToHereCall, parseNearOfActions, waitTransactionResult } from "./utils";
import { SignPayload } from "./signMessage";
import NearToken from "./NearToken";
import WrapToken from "./WrapToken";
import NeatToken from "./NeatToken";
import HereToken from "./HereToken";

export class NearAccount extends Account {
  readonly native: NearToken;
  readonly hnear: HereToken;
  readonly wnear: WrapToken;
  readonly neat: NeatToken;
  readonly api: NearApi;

  readonly events = new EventEmitter<{
    "transaction:error": { actions: transactions.Action[]; error: any; receiverId: string };
  }>();

  constructor(id: string, readonly type: ConnectType, signer: Signer, jwt?: string) {
    super(
      Connection.fromConfig({
        signer: signer,
        provider: new JsonRpcProvider({ url: getNodeUrl(NETWORK) }),
        jsvmAccountId: "jsvm." + NETWORK,
        networkId: NETWORK,
      }),
      id
    );

    this.api = new NearApi(new HereApi(jwt));
    this.native = new NearToken(this);
    this.hnear = new HereToken(this);
    this.wnear = new WrapToken(this);
    this.neat = new NeatToken(this);
  }

  async signAndSendTransaction({ receiverId, actions }: SignAndSendTransactionOptions) {
    const tx = await this.callTransaction({ receiverId, actions: actionsToHereCall(actions) });
    return await this.connection.provider.txStatus(tx, this.accountId);
  }
  async getActualNonce() {
    const publicKey = await this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);
    const rawAccessKey = await this.connection.provider.query<AccessKeyViewRaw>({
      request_type: "view_access_key",
      account_id: this.accountId,
      public_key: publicKey.toString(),
      finality: "optimistic",
    });

    const accessKey = { ...rawAccessKey, nonce: new BN(rawAccessKey.nonce) };
    return accessKey.nonce.add(new BN(1));
  }

  protected async signTransaction(receiverId: string, actions: transactions.Action[], nonce?: BN): Promise<[Uint8Array, transactions.SignedTransaction]> {
    if (nonce == null) nonce = await this.getActualNonce();
    const block = await this.connection.provider.block({ finality: "final" });
    const blockHash = block.header.hash;

    const trx = await transactions.signTransaction(receiverId, nonce, actions, base_decode(blockHash), this.connection.signer, this.accountId, this.connection.networkId);

    return trx;
  }

  async processingTx(tx: string, signal?: AbortSignal) {
    try {
      const result = await this.api.processing(tx, this.accountId, signal);
      if (!result.success) throw new TransactionError(result.error.readable_title, result.error.readable_body);
      if (signal?.aborted) throw Error();

      return await this.connection.provider.txStatus(tx, this.accountId);
    } catch (e) {
      if (signal?.aborted) throw e;
      if (e instanceof NetworkError && e.status !== 404) throw e;

      // Use fallback for processing tx, it backend down
      return await waitTransactionResult(tx, this.accountId, this.connection.provider, 0, signal);
    }
  }

  async executeTransaction(actions: transactions.Action[], receiverId: string, nonce?: BN): Promise<FinalExecutionOutcome> {
    let [tx, signedTx] = await this.signTransaction(receiverId, actions, nonce);
    return new Promise(async (resolve, reject) => {
      const abort = new AbortController();
      const errorHandler = (error: any) => {
        this.events.emit("transaction:error", { error, actions, receiverId });
        abort.abort();
        reject(error);
      };

      this.connection.provider.sendTransaction(signedTx).catch(errorHandler);
      this.processingTx(base_encode(tx), abort.signal).then(resolve).catch(errorHandler);
    });
  }

  async executeDelegate(actions: transactions.Action[], receiverId: string, nonce?: BN) {
    if (this.connection.networkId !== "mainnet") throw new DelegateNotAllowed();

    const delegate = await this.signedDelegate({ actions, receiverId, blockHeightTtl: 100, nonce }).catch(() => null);
    if (!delegate) throw new DelegateNotAllowed();

    const base64 = Buffer.from(encodeDelegateAction(delegate.delegateAction)).toString("base64");
    const signature = base_encode(delegate.signature.data);
    const auth = await this.api.isCanDelegate(base64, signature).catch(() => null);
    if (!auth) throw new DelegateNotAllowed();

    const hash = await this.api.sendDelegate(this.accountId, base64, signature, auth);
    if (!hash) throw Error("empty hash from delegated");

    return await this.processingTx(hash);
  }

  async signedDelegate({ actions, blockHeightTtl, receiverId, nonce }: any) {
    const { provider, signer } = this.connection;
    const { header } = await provider.block({ finality: "final" });

    if (nonce == null) nonce = await this.getActualNonce();
    const delegateAction = buildDelegateAction({
      actions,
      maxBlockHeight: new BN(header.height).add(new BN(blockHeightTtl)),
      nonce: nonce,
      publicKey: await this.getPublicKey(),
      receiverId,
      senderId: this.accountId,
    });

    const { signedDelegateAction } = await signDelegateAction({
      delegateAction,
      signer: {
        sign: async (message: any) => {
          const { signature } = await signer.signMessage(message, delegateAction.senderId, this.connection.networkId);
          return signature;
        },
      },
    });
    return signedDelegateAction;
  }

  async callTransactions(transactions: (HereCall | null)[], options?: { disableUnstake?: boolean; disableDelegate?: boolean }): Promise<string[]> {
    const results: string[] = [];
    let snapAccount: NearSnapAccount | null = null;

    for (let item of transactions) {
      if (item == null) continue;
      let batch: Transaction[] = [
        {
          signerId: this.accountId,
          receiverId: item.receiverId || this.accountId,
          // @ts-ignore
          actions: item.actions,
        },
      ];

      if (!options?.disableUnstake) {
        const allocateNear = parseNearOfActions(item.actions);
        const unstake = await this.tryAllocateNative(allocateNear);
        if (unstake) batch.unshift(unstake);
      } else if (this.type === ConnectType.WalletConnect) {
        const selector = await accounts.selector;
        const wallet = await selector.wallet(this.type);
        const txs = await wallet.signAndSendTransactions({ transactions: batch });
        if (!txs) throw Error();
        results.push(...txs.map((t) => t.transaction_outcome.id));
      }

      if (this.type === ConnectType.Web) {
        const txs = await this.sendLocalTransactions(batch);
        results.push(...txs);
      } else if (this.type === ConnectType.Snap) {
        if (snapAccount == null) {
          await accounts.snap.install();
          snapAccount = new NearSnapAccount({
            snap: accounts.snap,
            publicKey: await this.getPublicKey(),
            accountId: this.accountId,
            network: "mainnet",
          });
        }

        const txs = await snapAccount.executeTransactions(batch);
        results.push(...txs.map((t) => t.transaction_outcome.id));
      } else {
        const txs = await accounts.wallet.signAndSendTransactions({
          selector: { type: this.type, id: this.accountId },
          transactions: batch,
        });

        results.push(...txs.map((t) => t.transaction_outcome.id));
      }
    }

    return results;
  }

  async sendLocalTransactions(batch: HereCall[], disableDelegate?: boolean) {
    const results: string[] = [];
    for (let tx of batch) {
      const res = await this.sendLocalCall(tx, disableDelegate);
      results.push(res.transaction_outcome.id);
    }

    return results;
  }

  async sendLocalCall(tx: HereCall, disableDelegate?: boolean) {
    const receiverId = tx.receiverId ?? this.accountId;
    const actions: transactions.Action[] = tx.actions.map((act) => createAction(act));
    if (disableDelegate) {
      return await this.executeTransaction(actions, receiverId);
    }

    const nonce = await this.getActualNonce();
    try {
      return await this.executeDelegate(actions, receiverId, nonce);
    } catch (e) {
      return await this.executeTransaction(actions, receiverId, nonce);
    }
  }

  async signMessage(config: SignMessageOptionsNEP0413) {
    const payload = new SignPayload({
      message: config.message,
      nonce: Array.from(config.nonce),
      recipient: config.recipient,
    });

    const borshPayload = serialize(authPayloadSchema, payload);
    const signature = await this.connection.signer.signMessage(borshPayload, this.accountId, "mainnet");
    const publicKey = await this.connection.signer.getPublicKey(this.accountId, "mainnet");

    const base64 = Buffer.from(signature.signature).toString("base64");
    return { accountId: this.accountId, signature: base64, publicKey: publicKey.toString(), nonce: config.nonce };
  }

  async tryAllocateNative(amount: BN) {
    const { unstaked, available, wrapped, staked } = await this.getBalance();

    console.log("[tryAllocateNear] transfer", amount.toString());
    console.log("[tryAllocateNear] unstaked", unstaked.toString());
    console.log("[tryAllocateNear] staked", staked.toString());
    console.log("[tryAllocateNear] wrapped", wrapped.toString());
    console.log("[tryAllocateNear] total", available.toString());

    if (amount.cmp(new BN(parseAmount(0.01))) <= 0) {
      return console.log("[tryAllocateNear] abort: amount is too small for unstake");
    }

    if (staked.isZero()) {
      return console.log("[tryAllocateNear] abort: not staked near");
    }

    let safe = BN.max(new BN(0), unstaked.sub(NOT_STAKABLE_NEAR));
    if (safe.cmp(amount) >= 0) {
      return console.log("[tryAllocateNear] abort: allocation is not needed");
    }

    if (available.cmp(amount) < 0) {
      return console.log("[tryAllocateNear] abort: not enoght available balance");
    }

    const needFromStake = amount.sub(safe);
    console.log("[tryAllocateNear] needFromStake", needFromStake.toString());
    return await this.hnear.unstakeTransaction(needFromStake);
  }

  async callTransaction(call: HereCall, options?: { disableUnstake?: boolean }) {
    const [trx] = await this.callTransactions([call], options);
    return trx;
  }

  async getNativeBalance() {
    const { total, available } = await this.getAccountBalance();
    return { available: BN.max(new BN(0), new BN(available).isub(SAFE_NEAR)), total: new BN(total) };
  }

  async getBalance() {
    const [{ available, total }, staked, wrapped] = await Promise.all([
      this.getNativeBalance(),
      this.getTokenBalance(getHereStorage(this.connection.networkId)),
      this.getTokenBalance(getWrapNear(this.connection.networkId)),
    ]);

    return {
      staked,
      total,
      wrapped,
      unstaked: available,
      available: available.add(staked),
    };
  }

  async adjustBalance(token: FtModel, amount: string | BN): Promise<string> {
    if (token.chain !== Chain.NEAR) return "0";
    if (token.id === near.id || token.id === testnetNear.id) {
      const { available } = await this.getBalance();
      return BN.min(available, new BN(amount)).toString();
    }

    const available = await this.getTokenBalance(token.contract);
    return BN.min(available, new BN(amount)).toString();
  }

  async getTokenBalance(contractId: string) {
    const balance = await this.viewFunction({
      args: { account_id: this.accountId },
      methodName: "ft_balance_of",
      contractId,
    });

    return new BN(balance);
  }

  async rebindFullAccessKey(keyPair: KeyPair) {
    const publicKey = keyPair.getPublicKey().toString();
    const oldPublicKey = await this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);

    const call: HereCall = {
      actions: [
        { type: "AddKey", params: { publicKey, accessKey: { permission: "FullAccess" } } },
        { type: "DeleteKey", params: { publicKey: oldPublicKey.toString() } },
      ],
    };

    await this.callTransaction(call);

    if (this.connection.signer instanceof InMemorySigner) {
      await this.connection.signer.keyStore.setKey(this.connection.networkId, this.accountId, keyPair);
    }
  }

  async getRegisterTokenTrx(token: string, address = this.accountId): Promise<HereCall | null> {
    if (token === "") return null;
    if (token === GAME_ID || token == GAME_TESTNET_ID) return null;

    const storage = await ref.ftGetStorageBalance(token, address).catch(() => null);
    if (storage != null) return null;

    return {
      signerId: this.accountId,
      receiverId: token,
      actions: [
        {
          type: "FunctionCall",
          params: {
            gas: Number(30 * TGAS),
            methodName: "storage_deposit",
            deposit: "12500000000000000000000",
            args: {
              account_id: address,
              registration_only: true,
            },
          },
        },
      ],
    };
  }

  async viewMethod(contractId: string, methodName: string, args?: object) {
    return await this.viewFunction({ contractId, methodName, args });
  }

  async getPublicKey() {
    return this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);
  }

  async getKeys() {
    const pub = await this.getPublicKey();
    const keys = await this.getAccessKeys();
    const info = await this.api.getNearKeys();
    const infoDict = info.reduce<Record<string, NearAccessKey>>((acc, key) => {
      acc[key.public_key] = key;
      return acc;
    }, {});

    const data = keys.map<NearAccessKey>((key) => {
      const { create_ts, preview, dapp_name, receiver_id = null } = infoDict[key.public_key] ?? {};
      return {
        preview,
        create_ts: infoDict[key.public_key] ? create_ts : Math.floor(Date.now() / 1000),
        dapp_name,
        public_key: key.public_key,
        receiver_id: key.access_key.permission === "FullAccess" ? null : receiver_id ?? key.access_key.permission.FunctionCall.receiver_id,
      };
    });

    data.sort((a, b) => a.create_ts - b.create_ts);
    data.sort((a) => (a.receiver_id == null ? -1 : 1));

    const index = data.findIndex((a) => a.public_key === pub?.toString());
    const [removed] = data.splice(index, 1);
    if (removed) data.unshift(removed);
    return data;
  }

  async restrictAllLimitedKeys() {
    const pub = await this.getPublicKey();
    const keys = await this.getAccessKeys();
    const actions = keys
      .filter((key) => key.public_key !== pub.toString())
      .filter((key) => key.access_key.permission !== "FullAccess")
      .map<Action>((key) => ({ type: "DeleteKey", params: { publicKey: key.public_key } }));

    const promises = chunk(actions, 100).map((acts) => this.callTransaction({ actions: acts }));
    await Promise.all(promises);
  }

  async transfer(asset: FtModel, amount: BN | string, receiver: string) {
    if (asset.symbol === "NEAR") {
      const { available } = await this.getBalance();
      const deposit = BN.min(new BN(amount), available).toString();
      const actions: Action[] = [{ type: "Transfer", params: { deposit } }];
      return await this.callTransaction({ receiverId: receiver, actions });
    }

    return await this.transferToken(asset, amount, receiver);
  }

  async transferToken(asset: FtModel, amount: string | BN, receiver: string) {
    const actions: Action[] = [];
    const registerTrx = await this.getRegisterTokenTrx(asset.contract, receiver);
    if (registerTrx) actions.push(...registerTrx.actions);

    const balanceBN = await this.getTokenBalance(asset.contract);
    const deposit = BN.min(new BN(amount), balanceBN).toString();

    actions.push({
      type: "FunctionCall",
      params: {
        args: { receiver_id: receiver, amount: deposit },
        methodName: "ft_transfer",
        gas: 30 * TGAS,
        deposit: "1",
      },
    });

    return await this.callTransaction({ receiverId: asset.contract, actions });
  }

  async functionCall(data: ChangeFunctionCallOptions & { disableUnstake?: boolean }): Promise<FinalExecutionOutcome> {
    const { contractId, methodName, disableUnstake, args, gas, attachedDeposit } = data;
    const hash = await this.callTransaction(
      {
        receiverId: contractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName,
              args: args ?? {},
              gas: gas?.toString(10) ?? 30 * TGAS,
              deposit: attachedDeposit?.toString() ?? "0",
            },
          },
        ],
      },
      { disableUnstake }
    );

    return await this.connection.provider.txStatus(hash, this.accountId);
  }

  async findAccessKey() {
    const publicKey = await this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);
    if (!publicKey) throw new TypedError(`no matching key pair found in ${this.connection.signer}`, "PublicKeyNotFound");

    const rawAccessKey = await this.connection.provider.query<{ block_height: number; block_hash: string } & AccessKeyView>({
      request_type: "view_access_key",
      account_id: this.accountId,
      public_key: publicKey.toString(),
      finality: "optimistic",
    });

    const accessKey = Object.assign({}, rawAccessKey, { nonce: new BN(rawAccessKey.nonce) });
    return { publicKey, accessKey };
  }

  async getAccessKeyInfo(accountId: string, keyPair: KeyPair | PublicKey): Promise<any> {
    const publicKey = keyPair instanceof KeyPair ? keyPair.getPublicKey() : keyPair.toString();
    return this.connection.provider.query<any>(`access_key/${accountId}/${publicKey.toString()}`, "");
  }

  async getTransactionResult(txhash: string | Uint8Array) {
    const transaction = await this.connection.provider.txStatus(txhash, "unnused");
    return providers.getTransactionLastResult(transaction);
  }

  async getTransactionOutcomes(txhash: string | Uint8Array) {
    const transaction = await this.connection.provider.txStatus(txhash, "unnused");
    return transaction.receipts_outcome;
  }
}
