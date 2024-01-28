import { makeObservable, observable, runInAction } from "mobx";
import { KeyPair, Signature } from "near-api-js/lib/utils/key_pair";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { InMemorySigner, Signer } from "near-api-js";
import { PublicKey } from "near-api-js/lib/utils";
import { NearSnapStatus } from "@near-snap/sdk";

import { isTgMobile } from "../Mobile";
import { Storage, storage } from "./Storage";
import { HereApi } from "./network/api";
import { NearAccount } from "./near-chain/NearAccount";
import { TokensStorage } from "./token/TokensStorage";
import { TransactionsStorage } from "./transactions";
import { ConnectType, TransferParams, UserCred } from "./types";
import { NFTModel, RecentlyApps, UserContact, UserData } from "./network/types";
import { recaptchaToken, wait } from "./helpers";
import { NETWORK } from "./constants";
import { accounts } from "./Accounts";
import { Chain } from "./token/types";
import { notify } from "./toast";
import Hot from "./Hot";

function parseJwt(token: string) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

class UserAccount {
  readonly api: HereApi;
  readonly tokens: TokensStorage;
  readonly near: NearAccount;
  readonly transactions: TransactionsStorage;
  readonly localStorage: Storage;
  readonly hot!: Hot;

  readonly path?: string;
  readonly type: ConnectType;
  readonly id: string;

  public nfts: NFTModel[] = [];
  public metamaskNftCanReserve = false;
  public recentlyApps: RecentlyApps[] = [];
  public contacts: UserContact[] = [];
  public user: UserData = {
    can_bind_referral: false,
    phone_linked: false,
    abtests: [],
    id: "0",
  };

  constructor(creds: UserCred) {
    makeObservable(this, {
      user: observable,
      nfts: observable,
      contacts: observable,
      recentlyApps: observable,
      metamaskNftCanReserve: observable,
    });

    this.id = creds.accountId;
    this.type = creds.type;
    this.path = creds.path;

    this.api = new HereApi(creds.jwt);
    this.localStorage = new Storage(creds.accountId);

    if (window.Telegram.WebApp.initDataUnsafe?.user) {
      const key = `${window.Telegram.WebApp.initDataUnsafe.user.id}:${creds.accountId}`;
      this.localStorage = new Storage(key);

      // Migrate from global storage
      if (window.localStorage.getItem(key) == null) {
        this.localStorage.write(new Storage(creds.accountId).read());
      }
    }

    if (creds.privateKey) {
      const keyPair = KeyPair.fromString(creds.privateKey!);
      const keyStore = new InMemoryKeyStore();
      keyStore.setKey(NETWORK, creds.accountId, keyPair);
      const signer = new InMemorySigner(keyStore);
      this.near = new NearAccount(creds.accountId, this.type, signer, creds.jwt);
    } else {
      const signer = new HereSigner(creds.accountId);
      this.near = new NearAccount(creds.accountId, this.type, signer, creds.jwt);
    }

    this.transactions = new TransactionsStorage(this);
    this.tokens = new TokensStorage(this);

    if (isTgMobile()) this.hot = new Hot(this);
    this.transactions.refresh().catch(() => {});
    this.loadRecentlyApps().catch(() => {});
    this.fetchUser().catch(() => {});

    if (this.type === ConnectType.Snap) {
      this.near.viewMethod("metamask-nft.near", "nft_tokens_for_owner", { account_id: this.near.accountId }).then((data) => {
        if (data?.length > 0 || this.localStorage.get("metamask_nft_reserved")) return;
        if (!creds.jwt || parseJwt(creds.jwt).timestamp > 1706443363) return;
        runInAction(() => {
          this.metamaskNftCanReserve = true;
        });
      });
    }

    wait(100).then(async () => {
      if (this.near.type !== ConnectType.Snap) return;

      const status = await accounts.snap.getStatus();
      if (status !== NearSnapStatus.INSTALLED) await accounts.snap.install();

      const acc = await accounts.snap.getAccount("mainnet").catch(() => accounts.snap.connect({ network: "mainnet" }));
      if (acc?.accountId !== this.near.accountId || acc?.publicKey !== (await this.near.getPublicKey()).toString()) {
        notify("The address does not match, please re-login to your account");
        accounts.disconnect(this.near.accountId);
        return;
      }
    });
  }

  async reserveMetaNft() {
    await this.api.request("/api/v1/user/meta-nft/recover");
    runInAction(() => {
      this.localStorage.set("metamask_nft_reserved", true);
      this.metamaskNftCanReserve = false;
    });
  }

  async bindNickname(nickname: string) {
    const api = new HereApi();
    const captcha = await recaptchaToken();
    await api.allocateNickname({
      device_id: "metamask",
      public_key: (await this.near.getPublicKey()).toString(),
      recapcha_response: captcha,
      near_account_id: nickname,
      sign: "",
    });

    accounts.disconnect(this.near.accountId);
    notify("The nickname was successfully created. Attach it to your account and re-login to your wallet.", 4500);
    await accounts.connectSnap();
  }

  async isNeedActivate() {
    if (this.near.type !== ConnectType.Snap) return false;
    return this.near
      .getAccessKeyInfo(this.near.accountId, await this.near.getPublicKey())
      .then(() => false)
      .catch(() => true);
  }

  async fetchUser() {
    if (isTgMobile()) return;
    const user = await this.api.getUser();
    runInAction(() => (this.user = user));
  }

  async fetchNfts() {
    if (isTgMobile()) return;
    try {
      runInAction(() => (this.nfts = JSON.parse(this.localStorage.get("nfts")!)));
    } catch {}

    const nfts = await this.api.getNfts();
    this.localStorage.set("nfts", JSON.stringify(nfts));
    runInAction(() => (this.nfts = nfts));
  }

  async loadRecentlyApps() {
    if (isTgMobile()) return;
    const apps = await this.api.getRecentlyApps();
    runInAction(() => (this.recentlyApps = apps));
  }

  async loadContacts() {
    if (isTgMobile()) return;
    const contacts = await this.api.getContacts();
    runInAction(() => (this.contacts = contacts));
  }

  bindComment(tx: string, comment?: string) {
    if (!comment) return;
    void this.transactions.bindComment(tx, comment);
  }

  async transfer({ receiver, amount, token, comment }: TransferParams) {
    const ft = this.tokens.tokens[token];
    if (ft == null) throw Error("Unknown token for transfer");

    if (ft.chain === Chain.NEAR || ft.chain === Chain.NEAR_TESTNET) {
      const hash = await this.near.transfer(ft, amount, receiver);
      if (ft.symbol === "HOT") this.hot.action("transfer", { hash, amount: amount.toString(), receiver });
      this.bindComment(hash, comment);
      return hash;
    }
  }

  get isProduction() {
    return NETWORK === "mainnet";
  }
}

class HereSigner extends Signer {
  constructor(readonly id: string) {
    super();
  }

  createKey(): Promise<PublicKey> {
    throw Error("");
  }

  async getPublicKey(): Promise<PublicKey> {
    const acc = storage.getAccount(this.id);
    if (!acc) throw Error();
    return PublicKey.fromString(acc.publicKey);
  }

  async signMessage(): Promise<Signature> {
    throw Error();
  }
}

export default UserAccount;
