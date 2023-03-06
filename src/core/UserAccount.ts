import { action, makeObservable, observable, runInAction } from "mobx";
import { TransactionModel, TransactionType } from "./types";
import { WalletAccount } from "./WalletAccount";
import { HereApi } from "./api";
import StakeTips from "./StakeTips";

export class Storage {
  static memoryData: Record<string, any> = {};
  constructor(readonly id: string) {}

  set(key: string, value: any) {
    try {
      localStorage.setItem(this.id + ":" + key, value);
    } catch {
      Storage.memoryData[this.id + ":" + key] = value;
      parent.postMessage({ action: "saveLocalStorage", data: Storage.memoryData }, "*");
    }
  }

  get(key: string): string | null {
    try {
      return localStorage.getItem(this.id + ":" + key) || null;
    } catch {
      return Storage.memoryData[this.id + ":" + key] || null;
    }
  }
}

class UserAccount {
  public isInitialized = false;
  public isClaiming = false;

  public transactions: TransactionModel[] = [];
  public near2usd = 0;
  public state = {
    totalIncome: 0,
    accrued: 0,
    unstaked: 0,
    staked: 0,
    apy: 0.08,
  };

  readonly api = new HereApi();
  readonly storage = new Storage(this.wallet.accountId);
  readonly tips = new StakeTips(this);

  constructor(readonly wallet: WalletAccount) {
    makeObservable(this, {
      claimDividents: action,
      unstake: action,
      stake: action,

      isClaiming: observable,
      transactions: observable,
      isInitialized: observable,
      near2usd: observable,
      state: observable,
    });

    this.fetchState();
    this.fetchTransactions();
    setTimeout(() => this._fetchRate(), 5000);
    setTimeout(() => this.fetchTransactions(), 5000);
  }

  async _fetchRate() {
    const rate = await this.api.getRate("NEAR");
    runInAction(() => (this.near2usd = rate));
    setTimeout(() => this._fetchRate(), 5000);
  }

  async unstake(amount: number | "max", callback: string) {
    this.tips.unstake();
    const value = amount === "max" ? this.state.staked : amount;
    const trx = await this.wallet.unstakeHere(amount, callback);
    void this.fetchState();

    runInAction(() => {
      this.transactions.unshift({
        type: TransactionType.STAKE_UNSTAKE,
        timestamp: Math.floor(Date.now() / 1000),
        data: { amount: value, usd_rate: this.near2usd },
        transaction_hash: trx.transaction_outcome.id,
        from_account_id: "storage.herewallet.app",
        to_account_id: this.wallet.accountId,
      });
    });
  }

  async stake(amount: number | "max", callback: string) {
    this.tips.stake();
    const value = amount === "max" ? this.state.unstaked : amount;
    const trx = await this.wallet.stakeHere(amount, callback);
    void this.fetchState();

    runInAction(() => {
      this.transactions.unshift({
        type: TransactionType.STAKE_UNSTAKE,
        timestamp: Math.floor(Date.now() / 1000),
        data: { amount: value, usd_rate: this.near2usd },
        transaction_hash: trx.transaction_outcome.id,
        from_account_id: this.wallet.accountId,
        to_account_id: "storage.herewallet.app",
      });
    });
  }

  async fetchTransactions() {
    const trxs = await this.api.getStakingTransaction(this.wallet.accountId);
    runInAction(() => (this.transactions = trxs));
  }

  async fetchState() {
    const [rate, totalIncome, state] = await Promise.all([
      this.api.getRate("NEAR").catch(() => 0),
      this.api.getTotalDividents(this.wallet.accountId).catch(() => 0),
      this.wallet.getState().catch(() => ({})),
    ]);

    runInAction(() => {
      this.state = Object.assign({}, this.state, state, { totalIncome });
      this.isInitialized = true;
      this.near2usd = rate;
    });
  }

  async claimDividents() {
    try {
      if (this.isClaiming) return;
      this.isClaiming = true;
      const trx = await this.wallet.receiveDividends();

      runInAction(() => {
        this.isClaiming = false;
        this.transactions.unshift({
          type: TransactionType.DIVIDEND_PAYMENT,
          timestamp: Math.floor(Date.now() / 1000),
          data: { amount: this.state.accrued, usd_rate: this.near2usd },
          transaction_hash: trx.transaction_outcome.id,
          from_account_id: "storage.herewallet.app",
          to_account_id: this.wallet.accountId,
          deposit: "0",
        });

        this.state.staked += this.state.accrued;
        this.state.totalIncome += this.state.accrued;
        this.state.accrued = 0;
      });
    } catch (e: any) {
      runInAction(() => (this.isClaiming = false));
      throw e;
    }
  }
}

export default UserAccount;
