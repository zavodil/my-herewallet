import { action, makeObservable, observable } from "mobx";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { HereWallet, SignedMessageNEP0413, WidgetStrategy } from "@here-wallet/core";
import { authPayloadSchema } from "@here-wallet/core/src/nep0314";
import { base_encode, serialize } from "near-api-js/lib/utils/serialize";
import { KeyPair, KeyPairEd25519, PublicKey } from "near-api-js/lib/utils";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { InMemorySigner } from "near-api-js";
import { NearSnap } from "@near-snap/sdk";

import { SignPayload, signPayloadSchema } from "./near-chain/signMessage";
import { generateMnemonic } from "./near-chain/passphrase/bip39";
import { parseSeedPhrase } from "./near-chain/passphrase";
import { HereError } from "./network/types";
import UserAccount from "./UserAccount";

import { recaptchaToken } from "./helpers";
import { ConnectType, UserCred } from "./types";
import { generateFromString } from "generate-avatar";
import { ReceiverFetcher } from "./Receiver";
import { HereApi } from "./network/api";
import { storage } from "./Storage";
import { notify } from "./toast";

class Accounts {
  static shared = new Accounts();
  public account: UserAccount | null = null;
  public accounts: { id: string; type: ConnectType }[] = [];

  readonly api = new HereApi();
  readonly snap = new NearSnap();

  readonly selector = setupWalletSelector({
    modules: [
      setupSender(),
      setupMeteorWallet(),
      setupWalletConnect({
        projectId: "621c3cc4e9a5da50c1ed23c0f338bf06",
        chainId: "near:mainnet",
        metadata: {
          name: "HERE Stake",
          description: "Liquid Staking for Near Protocol",
          url: "https://my.herewallet.app/stake",
          icons: [],
        },
      }),
    ],
    network: "mainnet",
  });

  readonly wallet = new HereWallet({
    defaultStrategy: () =>
      new WidgetStrategy({
        widget: location.origin + "/connector",
        lazy: false,
      }),
  });

  constructor() {
    makeObservable(this, {
      account: observable,
      accounts: observable,
      disconnect: action,
      connectHere: action,
      connectSnap: action,
      connectWeb: action,
      select: action,
    });

    const { accounts, activeAccount } = storage.read();
    if (activeAccount) {
      let data = storage.getAccount(activeAccount);
      if (data) this.account = new UserAccount(data);
    }

    this.accounts = accounts;
  }

  select = (id: string) => {
    if (!this.accounts.find((t) => t.id === id)) return;
    const data = storage.getAccount(id);
    if (!data) return;

    this.account = new UserAccount(data);
    storage.selectAccount(id);
  };

  disconnect = (id: string) => {
    this.accounts = this.accounts.filter((t) => t.id !== id);
    const data = storage.getAccount(this.accounts[0]?.id);
    this.account = data ? new UserAccount(data) : null;
    storage.removeAccount(id);
    notify("Wallet has been disconnected");
  };

  importAccount = async ({ seed, secret }: { seed?: string; secret?: string }) => {
    const { publicKey, secretKey } = secret
      ? { publicKey: KeyPair.fromString(secret).getPublicKey().toString(), secretKey: secret }
      : parseSeedPhrase(seed || generateMnemonic());

    const api = new HereApi();
    const accounts = await api.findAccount(PublicKey.from(publicKey));
    if (accounts[0] == null) {
      notify("Account is not found");
      throw Error("Account is not found");
    }

    const keyPair = KeyPair.fromString(secretKey);
    const sign = await this.localSign(accounts[0], keyPair);
    const cred = { accountId: accounts[0], publicKey: publicKey, privateKey: secretKey, type: ConnectType.Web, seed };
    await this.addAccount(cred, sign);
  };

  async addAccount(cred: UserCred, sign: SignedMessageNEP0413 & { nonce: number[] }) {
    try {
      notify("Authorization...");
      const captcha = await recaptchaToken();
      const token = await this.api
        .auth({
          msg: "web_wallet",
          device_id: this.api.deviceId,
          recapcha_response: captcha,
          account_sign: base_encode(Buffer.from(sign.signature, "base64")),
          device_name: navigator.userAgent,
          near_account_id: sign.accountId,
          public_key: sign.publicKey.toString(),
          wallet_type: cred.type as any,
          nonce: sign.nonce,
          web_auth: true,
        })
        .catch(() => null);

      if (token == null) {
        notify("Authorization failed");
        return;
      }

      if (this.accounts.find((t) => t.id === cred.accountId)) {
        notify("Account already exist...");
        return;
      }

      storage.addAccount({ ...cred, jwt: token });
      const account = new UserAccount({ ...cred, jwt: token });

      const addAccount = action(() => {
        this.accounts.push({ id: cred.accountId, type: cred.type });
        this.account = account;
      });

      if (cred.type === ConnectType.Snap) {
        const needNickname = await account.isNeedActivate();
        const isNeed = needNickname && cred.type === ConnectType.Snap;
        addAccount();
        return isNeed;
      }

      addAccount();
    } catch (e: any) {
      if (e instanceof HereError) notify(e.body);
      throw e;
    }
  }

  async localSign(accountId: string, keyPair: KeyPair) {
    const keystore = new InMemoryKeyStore();
    await keystore.setKey("mainnet", accountId, keyPair);
    const signer = new InMemorySigner(keystore);

    const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
    const payload = new SignPayload({ message: "web_wallet", nonce: Array.from(nonce), recipient: "HERE Wallet" });
    const borshPayload = serialize(authPayloadSchema, payload);
    const signature = await signer.signMessage(borshPayload, accountId, "mainnet");
    const publicKey = await signer.getPublicKey(accountId, "mainnet");

    const base64 = Buffer.from(signature.signature).toString("base64");
    return { accountId, signature: base64, publicKey: publicKey.toString(), nonce };
  }

  async connectWeb(seed: string, nickname?: string) {
    const { defaultAddress, publicKey, secretKey } = parseSeedPhrase(seed);
    const accountId = nickname || defaultAddress;

    notify("Activating account...");
    const api = new HereApi();
    const captcha = await recaptchaToken();
    await api.allocateNickname({
      device_id: "metamask",
      public_key: publicKey,
      near_account_id: accountId,
      recapcha_response: captcha,
      sign: "",
    });

    const keyPair = KeyPair.fromString(secretKey);
    const sign = await this.localSign(accountId, keyPair);
    const cred = {
      type: ConnectType.Web,
      accountId: accountId,
      publicKey: publicKey.toString(),
      privateKey: secretKey,
      seed,
    };

    return await this.addAccount(cred, sign);
  }

  async connectSelector() {
    return new Promise(async (resolve, reject) => {
      try {
        const selector = await this.selector;
        const currentWallet = await selector.wallet().catch(() => null);

        if (currentWallet) {
          const [account] = await currentWallet.getAccounts();
          await currentWallet.signOut();
          this.disconnect(account.accountId);
        }

        const modal = setupModal(selector, { contractId: "" });
        modal.show();

        const onSigned = async ({ walletId = "" }) => {
          try {
            selector.off("signedIn", onSigned);
            const wallet = await selector.wallet(walletId);
            modal.hide();

            const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
            const sign = await wallet.signMessage({
              nonce: Buffer.from(nonce),
              recipient: "HERE Wallet",
              message: "web_wallet",
            });

            if (sign == null) {
              reject();
              return;
            }

            let type = ConnectType.Meteor;
            if (walletId === ConnectType.Sender) type = ConnectType.Sender;
            if (walletId === ConnectType.MyNearWallet) type = ConnectType.MyNearWallet;
            if (walletId === ConnectType.WalletConnect) type = ConnectType.WalletConnect;

            const cred = { type, accountId: sign.accountId, publicKey: sign.publicKey };
            await this.addAccount(cred, { ...sign, nonce });
            resolve(false);
          } catch (e) {
            reject(e);
          }
        };

        selector.on("signedIn", onSigned);
      } catch (e) {
        reject(e);
      }
    });
  }

  async connectSnap() {
    await this.snap.install();
    const account = await this.snap.connect({ network: "mainnet" });
    if (account?.publicKey == null || account?.accountId == null) {
      notify("Register failed");
      return;
    }

    const names = await this.api.findAccount(PublicKey.from(account.publicKey));
    if (names[0] != null && names[0] !== account.accountId) {
      try {
        await accounts.snap.provider.invokeSnap(accounts.snap.id, "near_bindNickname", {
          network: "mainnet",
          nickname: names[0],
        });
      } catch {
        notify("You need bind nickname before login, but something failed, restart page and try again please", 5000);
        return;
      }
    }

    const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
    const signMaybe = await this.snap.signMessage({
      nonce: Array.from(new Uint8Array(Buffer.from(nonce))),
      recipient: "HERE Wallet",
      message: "web_wallet",
      network: "mainnet",
    });

    if (!signMaybe) return notify("Access denied");

    const cred = { type: ConnectType.Snap, accountId: signMaybe.accountId!, publicKey: signMaybe.publicKey! };
    return await this.addAccount(cred, { ...(signMaybe as any), nonce });
  }

  async connectHere() {
    const nonce = [...crypto.getRandomValues(new Uint8Array(32))];

    // @ts-ignore
    const sign = await this.wallet.signMessage({
      selector: { type: ConnectType.Here },
      nonce: Buffer.from(nonce),
      recipient: "HERE Wallet",
      message: "web_wallet",
    });

    const cred = { type: ConnectType.Here, accountId: sign.accountId, publicKey: sign.publicKey };
    return await this.addAccount(cred, { ...sign, nonce });
  }

  async connectLedger() {
    const keyPair = KeyPairEd25519.fromRandom();
    const cred = { type: ConnectType.Ledger, accountId: "", publicKey: "", path: "" };

    await this.wallet.signAndSendTransaction({
      // @ts-ignore
      selector: { type: ConnectType.Ledger },
      onSuccess: (result: any) => {
        cred.accountId = result.account_id;
        cred.publicKey = result.public_key;
        console.log(cred);
        cred.path = result.path;
      },
      actions: [
        {
          type: "AddKey",
          params: {
            publicKey: keyPair.getPublicKey().toString(),
            accessKey: { permission: { receiverId: "herewallet.near" } },
          },
        },
      ],
    });

    const sign = await this.localSign(cred.accountId, keyPair);
    return await this.addAccount(cred, sign);
  }

  async getAvatar(id: string, type: ConnectType) {
    if (id) {
      const user = await ReceiverFetcher.shared.getUser(id).catch(() => null);
      return user?.avatar || `data:image/svg+xml;utf8,${generateFromString(id)}`;
    }

    if (type === ConnectType.Here) return require("../assets/here.svg");
    if (type === ConnectType.Ledger) return require("../assets/ledger.png");
    if (type === ConnectType.Snap) return require("../assets/metamask.svg");
    return require("../assets/here.svg");
  }
}

export const accounts = Accounts.shared;
export const useWallet = () => accounts.account;

export default Accounts;
