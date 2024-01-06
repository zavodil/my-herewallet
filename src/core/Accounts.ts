import { action, makeObservable, observable } from "mobx";
import { HereWallet, SignedMessageNEP0413, WidgetStrategy } from "@here-wallet/core";
import { base_encode, serialize } from "near-api-js/lib/utils/serialize";
import { KeyPair, KeyPairEd25519, PublicKey } from "near-api-js/lib/utils";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { InMemorySigner } from "near-api-js";
import { NearSnap } from "@near-snap/sdk";

import { SignPayload, signPayloadSchema } from "./near-chain/signMessage";
import { generateMnemonic } from "./near-chain/passphrase/bip39";
import { parseSeedPhrase } from "./near-chain/passphrase";
import { ConnectType, UserCred } from "./types";
import { getStorageJson, wait } from "./helpers";
import { HereError } from "./network/types";
import UserAccount from "./UserAccount";
import { HereApi } from "./network/api";
import { notify } from "./toast";

class Accounts {
  static shared = new Accounts();
  public account: UserAccount | null = null;
  public accounts: UserCred[] = [];

  readonly api = new HereApi();
  readonly snap = new NearSnap();

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

    this.accounts = getStorageJson("accounts", []);
    const selected = localStorage.getItem("selected");
    const account = this.accounts.find((t) => t.accountId === selected);
    if (account) this.account = new UserAccount(account);
  }

  select = (selected: string) => {
    const account = this.accounts.find((t) => t.accountId === selected);
    if (!account) return;

    this.account = new UserAccount(account);
    localStorage.setItem("selected", selected);
  };

  disconnect = (id: string) => {
    this.accounts = this.accounts.filter((t) => t.accountId !== id);
    this.account = this.accounts[0] ? new UserAccount(this.accounts[0]) : null;
    localStorage.setItem("selected", JSON.stringify(this.account?.credential.accountId || ""));
    localStorage.setItem("accounts", JSON.stringify(this.accounts));
    notify("Wallet has been disconnected");
  };

  importAccount = async ({ seed, secret }: { seed?: string; secret?: string }) => {
    const { publicKey, secretKey } = secret
      ? { publicKey: (await KeyPair.fromString(secret).getPublicKey()).toString(), secretKey: secret }
      : parseSeedPhrase(seed || generateMnemonic());

    const api = new HereApi("metamask");
    const accounts = await api.findAccount(PublicKey.from(publicKey));
    if (accounts[0] == null) {
      notify("Account is not found");
      throw Error("Account is not found");
    }

    const keyPair = KeyPair.fromString(secretKey);
    const sign = await this.localSign(accounts[0], keyPair);
    await this.addAccount(ConnectType.Web, sign);
  };

  async addAccount(type: ConnectType, sign: SignedMessageNEP0413 & { nonce: number[] }) {
    try {
      notify("Authorization...");
      const token = await this.api
        .auth({
          msg: "web_wallet",
          device_id: this.api.deviceId,
          account_sign: base_encode(Buffer.from(sign.signature, "base64")),
          device_name: navigator.userAgent,
          near_account_id: sign.accountId,
          public_key: sign.publicKey.toString(),
          wallet_type: type as any,
          nonce: sign.nonce,
          web_auth: true,
        })
        .catch(() => "");

      const data = { type, accountId: sign.accountId, publicKey: sign.publicKey, jwt: token };
      if (this.accounts.find((t) => t.accountId === data.accountId)) {
        notify("Account already exist...");
        return;
      }

      const account = new UserAccount(data);
      const addAccount = action(() => {
        this.accounts.push(data);
        this.account = account;
        localStorage.setItem("accounts", JSON.stringify(this.accounts));
        localStorage.setItem("selected", data.accountId);
      });

      if (type === ConnectType.Snap) {
        const needNickname = await account.isNeedActivate();
        const isNeed = needNickname && data.type === ConnectType.Snap;
        console.log(needNickname, data.type);
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
    const borshPayload = serialize(signPayloadSchema, payload);
    const signature = await signer.signMessage(borshPayload, accountId, "mainnet");
    const publicKey = await signer.getPublicKey(accountId, "mainnet");

    const base64 = Buffer.from(signature.signature).toString("base64");
    return { accountId, signature: base64, publicKey: publicKey.toString(), nonce };
  }

  async connectWeb(seed: string, nickname?: string) {
    const { defaultAddress, publicKey, secretKey } = parseSeedPhrase(seed);
    const accountId = nickname || defaultAddress;

    notify("Activating account...");
    const api = new HereApi("metamask");
    await api.allocateNickname({
      device_id: "metamask",
      public_key: publicKey,
      near_account_id: accountId,
      sign: "",
    });

    localStorage.setItem(publicKey.toString(), JSON.stringify({ seed, secret: secretKey }));

    const keyPair = KeyPair.fromString(secretKey);
    const sign = await this.localSign(accountId, keyPair);
    return await this.addAccount(ConnectType.Web, sign);
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
      network: "mainnet",
      nonce: Array.from(new Uint8Array(Buffer.from(nonce))),
      recipient: "HERE Wallet",
      message: "web_wallet",
    });

    if (!signMaybe) return notify("Access denied");
    return await this.addAccount(ConnectType.Snap, { ...(signMaybe as any), nonce });
  }

  async connectHere() {
    let type = ConnectType.Here;
    const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
    const sign = await this.wallet.signMessage({
      nonce: Buffer.from(nonce),
      recipient: "HERE Wallet",
      message: "web_wallet",
      onSuccess: (result: any) => {
        try {
          type = JSON.parse(result.payload).type || ConnectType.Here;
        } catch {
          type = ConnectType.Here;
        }
      },
    });

    return await this.addAccount(type, { ...sign, nonce });
  }

  async connectLedger() {
    const keyPair = KeyPairEd25519.fromRandom();
    let accountId = "";

    const result = await this.wallet.signAndSendTransaction({
      onSuccess: (result) => (accountId = result.account_id!),
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

    console.log("connectLedger", result);

    await wait(1000);
    const sign = await this.localSign(accountId, keyPair);
    return await this.addAccount(ConnectType.Ledger, sign);
  }
}

export const accounts = Accounts.shared;
export const useWallet = () => accounts.account;

export default Accounts;
