import BN from "bn.js";
import { JsonRpcProvider, TypedError } from "near-api-js/lib/providers";
import { base_decode, base_encode, serialize } from "near-api-js/lib/utils/serialize";
import { AccessKeyView, AccessKeyViewRaw, FinalExecutionOutcome } from "near-api-js/lib/providers/provider";
import { Account, Connection, InMemorySigner, KeyPair, Signer, providers, transactions } from "near-api-js";
import { ChangeFunctionCallOptions } from "near-api-js/lib/account";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { encodeDelegateAction } from "@near-js/transactions";
import { Action, HereCall, SignMessageOptionsNEP0413, createAction } from "@here-wallet/core";
import { PublicKey } from "near-api-js/lib/utils";
import { NearSnapAccount } from "@near-snap/sdk";
import * as ref from "@ref-finance/ref-sdk";

import { near, testnetNear } from "../token/defaults";
import { Chain, FtModel } from "../token/types";
import { chunk, parseAmount } from "../helpers";
import { TGAS } from "../constants";

import { ConnectType, UserCred } from "../types";
import NearApi, { DelegateNotAllowed, NearAccessKey } from "../network/near";
import { RequestError, ResponseError, TransactionError } from "../network/types";
import { accounts } from "../Accounts";
import { HereApi } from "../network/api";

import { NOT_STAKABLE_NEAR, getHereStorage, getWrapNear } from "./constants";
import { SAFE_NEAR, parseNearOfActions, waitTransactionResult } from "./utils";
import { SignPayload, signPayloadSchema } from "./signMessage";
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

  constructor(readonly creds: UserCred & { signer?: Signer }) {
    console.log(creds);
    super(
      Connection.fromConfig({
        signer: creds.signer || new InMemorySigner(new InMemoryKeyStore()),
        provider: new JsonRpcProvider({ url: "https://rpc.herewallet.app" }),
        jsvmAccountId: "jsvm.mainnet",
        networkId: "mainnet",
      }),
      creds.accountId
    );

    this.api = new NearApi(new HereApi(creds.jwt));
    this.native = new NearToken(this);
    this.hnear = new HereToken(this);
    this.wnear = new WrapToken(this);
    this.neat = new NeatToken(this);
  }

  protected async signTransaction(
    receiverId: string,
    actions: transactions.Action[]
  ): Promise<[Uint8Array, transactions.SignedTransaction]> {
    const publicKey = await this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);
    const rawAccessKey = await this.connection.provider.query<AccessKeyViewRaw>({
      request_type: "view_access_key",
      account_id: this.accountId,
      public_key: publicKey.toString(),
      finality: "optimistic",
    });

    const accessKey = { ...rawAccessKey, nonce: new BN(rawAccessKey.nonce) };
    const block = await this.connection.provider.block({ finality: "final" });
    const blockHash = block.header.hash;

    const nonce = accessKey.nonce.add(new BN(1));
    const trx = await transactions.signTransaction(
      receiverId,
      nonce,
      actions,
      base_decode(blockHash),
      this.connection.signer,
      this.accountId,
      this.connection.networkId
    );

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
      if (!(e instanceof ResponseError)) throw e;
      // Use fallback for processing tx, it backend down
      return await waitTransactionResult(tx, this.accountId, this.connection.provider, 0, signal);
    }
  }

  async executeTransaction(actions: transactions.Action[], receiverId: string): Promise<FinalExecutionOutcome> {
    let [tx, signedTx] = await this.signTransaction(receiverId, actions);
    return new Promise(async (resolve, reject) => {
      const abort = new AbortController();
      this.connection.provider.sendTransaction(signedTx).catch((err) => {
        abort.abort();
        reject(err);
      });

      this.processingTx(base_encode(tx), abort.signal).then(resolve).catch(reject);
    });
  }

  async executeDelegate(actions: transactions.Action[], receiverId: string) {
    if (this.connection.networkId !== "mainnet") throw new DelegateNotAllowed();

    const delegate = await this.signedDelegate({ actions, receiverId, blockHeightTtl: 100 });
    const base64 = Buffer.from(encodeDelegateAction(delegate.delegateAction)).toString("base64");
    const isAllowed = await this.api.isCanDelegate(base64);
    if (!isAllowed) throw new DelegateNotAllowed();

    const signature = base_encode(delegate.signature.data);
    const hash = await this.api.sendDelegate(base64, signature);
    if (!hash) throw Error("empty hash from delegated");
    return await this.processingTx(hash);
  }

  async callTransactions(
    transactions: (HereCall | null)[],
    options?: { disableUnstake?: boolean; disableDelegate?: boolean }
  ): Promise<string[]> {
    const results: string[] = [];
    let snapAccount: NearSnapAccount | null = null;

    for (let item of transactions) {
      if (item == null) continue;
      let batch = [item];

      if (!options?.disableUnstake) {
        const allocateNear = parseNearOfActions(item.actions);
        const unstake = await this.tryAllocateNative(allocateNear);
        if (unstake) batch.unshift(unstake);
      }

      if (this.creds.type === ConnectType.Snap) {
        if (snapAccount == null) {
          await accounts.snap.install();
          snapAccount = new NearSnapAccount({
            snap: accounts.snap,
            publicKey: PublicKey.fromString(this.creds.publicKey),
            accountId: this.creds.accountId,
            network: "mainnet",
          });
        }

        // @ts-expect-error: receiverId is not undefined
        const txs = await snapAccount.executeTransactions(batch);
        results.push(...txs.map((t) => t.transaction_outcome.id));
      }

      const txs = await accounts.wallet.signAndSendTransactions({
        // @ts-ignore
        selector: { type: this.creds.type, id: this.accountId },
        transactions: batch,
      });
      results.push(...txs.map((t) => t.transaction_outcome.id));
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
    const actions = tx.actions.map((act) => createAction(act));

    if (disableDelegate) {
      return await this.executeDelegate(actions, receiverId);
    }

    try {
      return await this.executeDelegate(actions, receiverId);
    } catch (e) {
      const isInternalError =
        e instanceof DelegateNotAllowed || e instanceof ResponseError || e instanceof RequestError;
      if (!isInternalError) throw e;
      return await this.executeTransaction(actions, receiverId);
    }
  }

  async signMessage(config: SignMessageOptionsNEP0413) {
    const payload = new SignPayload({
      message: config.message,
      nonce: Array.from(config.nonce),
      recipient: config.recipient,
    });

    const borshPayload = serialize(signPayloadSchema, payload);
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
        receiver_id:
          key.access_key.permission === "FullAccess"
            ? null
            : receiver_id ?? key.access_key.permission.FunctionCall.receiver_id,
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
    if (!publicKey)
      throw new TypedError(`no matching key pair found in ${this.connection.signer}`, "PublicKeyNotFound");

    const rawAccessKey = await this.connection.provider.query<
      { block_height: number; block_hash: string } & AccessKeyView
    >({
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
