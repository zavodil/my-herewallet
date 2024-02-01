import { action, makeObservable, observable, runInAction } from "mobx";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { HereWallet, SignedMessageNEP0413, WidgetStrategy } from "@here-wallet/core";
import { base_encode, serialize } from "near-api-js/lib/utils/serialize";
import { KeyPair, KeyPairEd25519, PublicKey } from "near-api-js/lib/utils";
import { authPayloadSchema } from "@here-wallet/core/src/nep0314";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { InMemorySigner } from "near-api-js";
import { NearSnap } from "@near-snap/sdk";

import { isTgMobile } from "../env";
import { SignPayload } from "./near-chain/signMessage";
import { generateMnemonic } from "./near-chain/passphrase/bip39";
import { parseSeedPhrase } from "./near-chain/passphrase";
import UserAccount from "./UserAccount";

import { recaptchaToken, wait } from "./helpers";
import { ConnectType, UserCred } from "./types";
import { generateFromString } from "generate-avatar";
import { ReceiverFetcher } from "./Receiver";
import { HereApi } from "./network/api";
import { storage } from "./Storage";
import { notify } from "./toast";
import { NEAR_DOMAINS } from "./near-chain/constants";

class Accounts {
  static shared = new Accounts();
  public account: UserAccount | null = null;
  public accounts: { id: string; type: ConnectType }[] = [];

  readonly api = new HereApi();
  readonly snap = new NearSnap();
  readonly selector = setupWalletSelector({
    network: "mainnet",
    modules: [
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
  });

  readonly wallet = new HereWallet({
    defaultStrategy: () =>
      new WidgetStrategy({
        widget: location.origin + "/connector",
        lazy: false,
      }),
  });

  public telegramAccountId: string | null = null;

  constructor() {
    makeObservable(this, {
      telegramAccountId: observable,
      account: observable,
      accounts: observable,
      disconnect: action,
      connectHere: action,
      connectSnap: action,
      connectWeb: action,
      select: action,
      init: action,
    });

    this.init();
    this.fetchTelegramUser();
  }

  async fetchTelegramUser() {
    const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!telegramId) return;

    const res = await this.api.request(`/api/v1/user/hot/by_telegram_id?telegram_id=${telegramId}`);
    const { near_account_id } = await res.json();
    runInAction(() => (this.telegramAccountId = near_account_id));
  }

  init() {
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

  importAccount = async (key: string, nickname?: string) => {
    let keyPair: KeyPair | null = null;
    try {
      keyPair = KeyPair.fromString(key);
    } catch {}

    const { publicKey, secretKey, seedPhrase, defaultAddress } = keyPair
      ? {
          secretKey: keyPair.toString(),
          publicKey: keyPair.getPublicKey().toString(),
          defaultAddress: Buffer.from(keyPair.getPublicKey().toString()).toString("hex"),
          seedPhrase: undefined,
        }
      : parseSeedPhrase(key || generateMnemonic());

    const api = new HereApi();
    const accounts = await api.findAccount(PublicKey.from(publicKey)).catch(() => []);
    const accountId = accounts[0] || nickname || defaultAddress;

    keyPair = KeyPair.fromString(secretKey);
    const sign = await this.localSign(accountId, keyPair);
    const cred = {
      accountId: accountId,
      publicKey: publicKey,
      privateKey: secretKey,
      type: ConnectType.Web,
      seed: seedPhrase,
    };

    await this.addAccount(cred, sign);
  };

  async addAccount(cred: UserCred, sign: SignedMessageNEP0413 & { nonce: number[] }) {
    try {
      if (!isTgMobile()) notify("Authorization...");
      const captcha = isTgMobile() ? "" : await recaptchaToken();
      const token = await this.api.auth({
        msg: "web_wallet",
        device_id: this.api.deviceId,
        recapcha_response: captcha,
        account_sign: base_encode(Buffer.from(sign.signature, "base64")),
        device_name: navigator.userAgent,
        near_account_id: sign.accountId,
        public_key: sign.publicKey.toString(),
        nonce: sign.nonce,
      });

      this.fetchTelegramUser();
      storage.addAccount({ ...cred, jwt: token });

      const account = new UserAccount({ ...cred, jwt: token });
      const addAccount = action(() => {
        this.accounts = storage.read()?.accounts || [];
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
      notify(e?.toString?.());
      throw e;
    }
  }

  async localSign(accountId: string, keyPair: KeyPair) {
    const keystore = new InMemoryKeyStore();
    await keystore.setKey("mainnet", accountId, keyPair);
    const signer = new InMemorySigner(keystore);

    const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
    const payload = new SignPayload({
      message: "web_wallet",
      nonce: Array.from(nonce),
      recipient: "HERE Wallet",
    });

    const borshPayload = serialize(authPayloadSchema, payload);
    const signature = await signer.signMessage(borshPayload, accountId, "mainnet");
    const publicKey = await signer.getPublicKey(accountId, "mainnet");

    const base64 = Buffer.from(signature.signature).toString("base64");
    return { accountId, signature: base64, publicKey: publicKey.toString(), nonce };
  }

  async connectWeb(seed: string, nickname?: string) {
    const { defaultAddress, publicKey, secretKey } = parseSeedPhrase(seed);
    const accountId = nickname || defaultAddress;

    if (!isTgMobile()) notify("Activating account...");
    const api = new HereApi();

    const checkAllocate = async (startTime: number) => {
      if (Date.now() - startTime > 10_000) throw Error("The server is overloaded, please try later");
      await wait(2000);
      const data = await this.wallet.rpc.query({ request_type: "view_account", account_id: accountId, finality: "optimistic" }).catch(() => null);
      if (data == null) await checkAllocate(startTime);
    };

    if (isTgMobile()) {
      const params = { telegram_data: window.Telegram?.WebApp?.initData, near_account_id: accountId, public_key: publicKey };
      await api.allocateHotNickname(params).catch(() => {});
      await checkAllocate(Date.now()).catch(async () => {
        await api.allocateHotNickname(params).catch(() => {});
        await checkAllocate(Date.now()).catch(async () => {
          await api.allocateHotNickname(params).catch(async () => {
            await checkAllocate(Date.now());
            this.fetchTelegramUser();
          });
        });
      });
    }

    if (!isTgMobile()) {
      const captcha = await recaptchaToken();
      await api.allocateNickname({ device_id: this.api.deviceId, public_key: publicKey, near_account_id: accountId, recapcha_response: captcha, sign: "" });
    }

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
        const wallet = await selector.wallet("wallet-connect");
        const exists = await wallet.getAccounts();

        if (exists.length > 0) {
          const [account] = await wallet.getAccounts();
          await wallet.signOut();
          this.disconnect(account.accountId);
        }

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

        const cred = { type: ConnectType.WalletConnect, accountId: sign.accountId, publicKey: sign.publicKey };
        await this.addAccount(cred, { ...sign, nonce });
        resolve(false);
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
      selector: { type: ConnectType.Ledger },
      onSuccess: (result: any) => {
        cred.accountId = result.account_id;
        cred.publicKey = result.public_key;
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
