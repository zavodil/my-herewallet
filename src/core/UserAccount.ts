import { makeObservable, observable, runInAction } from "mobx";
import { PublicKey } from "near-api-js/lib/utils";
import BN from "bn.js";

import { Storage } from "./Storage";
import { HereApi } from "./network/api";
import { NearAccount } from "./near-chain/NearAccount";
import { TokensStorage } from "./token/TokensStorage";
import { TransactionsStorage } from "./transactions";
import { NFTModel, RecentlyApps, UserContact, UserData } from "./network/types";
import { accounts } from "./Accounts";
import { Chain } from "./token/types";
import { wait } from "./helpers";
import { notify } from "./toast";
import { NearSnapStatus } from "@near-snap/sdk";

export enum ConnectType {
  Ledger = "ledger",
  Here = "here",
  Snap = "snap",
}

interface TransferParams {
  receiver: string;
  amount: string | BN;
  type: "address";
  token: string;
  comment?: string;
}

class UserAccount {
  readonly api: HereApi;
  readonly tokens: TokensStorage;
  readonly near: NearAccount;
  readonly transactions: TransactionsStorage;
  readonly localStorage: Storage;

  public nfts: NFTModel[] = [];
  public recentlyApps: RecentlyApps[] = [];
  public contacts: UserContact[] = [];
  public user: UserData = {
    can_bind_referral: false,
    phone_linked: false,
    abtests: [],
    id: "0",
  };

  isFlask = true;

  constructor(readonly credential: { type: ConnectType; accountId: string; publicKey: string; jwt: string }) {
    makeObservable(this, {
      user: observable,
      nfts: observable,
      contacts: observable,
      recentlyApps: observable,
      isFlask: observable,
    });

    this.api = new HereApi(credential.jwt);
    this.localStorage = new Storage(credential.accountId);

    this.tokens = new TokensStorage(this);
    this.transactions = new TransactionsStorage(this);
    this.near = new NearAccount(this, credential.accountId, credential.type);

    this.transactions.refresh().catch(() => {});
    this.tokens.refreshTokens().catch(() => {});
    this.loadRecentlyApps().catch(() => {});
    this.fetchUser().catch(() => {});

    wait(100).then(async () => {
      if (this.credential.type !== ConnectType.Snap) return;

      // @ts-ignore
      const version = await window.ethereum?.request({ method: "web3_clientVersion" }).catch(() => "");
      runInAction(() => (this.isFlask = version.includes("flask")));

      const status = await accounts.snap.getStatus();
      if (status !== NearSnapStatus.INSTALLED) await accounts.snap.install();

      const acc = await accounts.snap.getAccount("mainnet").catch(() => accounts.snap.connect({ network: "mainnet" }));
      if (acc?.accountId !== this.credential.accountId || acc?.publicKey !== this.credential.publicKey) {
        notify("The address does not match, please re-login to your account");
        accounts.disconnect(this.credential.accountId);
        return;
      }
    });
  }

  async bindNickname(nickname: string) {
    const api = new HereApi("metamask");
    await api.allocateNickname({
      device_id: "metamask",
      public_key: this.credential.publicKey,
      near_account_id: nickname,
      sign: "",
    });

    accounts.disconnect(this.credential.accountId);
    notify("The nickname was successfully created. Attach it to your account and re-login to your wallet.");
    await accounts.register(this.credential.type);
  }

  async isNeedActivate() {
    if (this.credential.type !== ConnectType.Snap) return false;
    return this.near
      .getAccessKeyInfo(this.credential.accountId, PublicKey.from(this.credential.publicKey))
      .then(() => false)
      .catch(() => true);
  }

  async fetchUser() {
    const user = await this.api.getUser();
    runInAction(() => (this.user = user));
  }

  async fetchNfts() {
    try {
      runInAction(() => (this.nfts = JSON.parse(this.localStorage.get("nfts")!)));
    } catch {}

    const nfts = await this.api.getNfts();
    this.localStorage.set("nfts", JSON.stringify(nfts));
    runInAction(() => (this.nfts = nfts));
  }

  async loadRecentlyApps() {
    const apps = await this.api.getRecentlyApps();
    runInAction(() => (this.recentlyApps = apps));
  }

  async loadContacts() {
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
      this.bindComment(hash, comment);
      return hash;
    }
  }

  get isProduction() {
    return true;
  }
}

export default UserAccount;
