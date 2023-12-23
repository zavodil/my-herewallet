import { makeObservable, observable, runInAction } from "mobx";
import BN from "bn.js";

import { Storage } from "./Storage";
import { HereApi } from "./network/api";
import { NearAccount } from "./near-chain/NearAccount";
import { TokensStorage } from "./token/TokensStorage";
import { TransactionsStorage } from "./transactions";
import { NFTModel, UserContact, UserData } from "./network/types";
import { Chain } from "./token/types";

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
  public contacts: UserContact[] = [];
  public user: UserData = {
    can_bind_referral: false,
    phone_linked: false,
    abtests: [],
    id: "0",
  };

  constructor(readonly credential: { type: ConnectType; accountId: string; publicKey: string; jwt: string }) {
    makeObservable(this, {
      user: observable,
      nfts: observable,
      contacts: observable,
    });

    this.api = new HereApi(credential.jwt);
    this.localStorage = new Storage(credential.accountId);

    this.tokens = new TokensStorage(this);
    this.transactions = new TransactionsStorage(this);
    this.near = new NearAccount(this, credential.accountId, credential.type);

    this.transactions.refresh().catch(() => {});
    this.tokens.refreshTokens().catch(() => {});
    this.fetchUser().catch(() => {});
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
