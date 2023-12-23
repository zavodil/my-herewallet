import { makeObservable, observable, runInAction } from "mobx";

import UserAccount from "../UserAccount";
import { CashbackData, TransactionModel } from "./types";
import TransactionApi, { TransactionsQuery } from "../network/transactions";

export class TransactionsStorage {
  private remote: TransactionApi;

  public isLoading = false;
  public list: TransactionModel[] = [];
  public cashback: CashbackData | null = null;

  constructor(private readonly user: UserAccount) {
    makeObservable(this, {
      list: observable,
      cashback: observable,
      isLoading: observable,
    });

    this.remote = new TransactionApi(user.api);

    try {
      this.list = JSON.parse(user.localStorage.get("transactions") ?? "");
    } catch {
      this.isLoading = true;
    }
  }

  async bindComment(tx: string, comment: string) {
    await this.remote.bindComment(tx, comment);
  }

  async get(data: TransactionsQuery) {
    return await this.remote.getTransactions(data);
  }

  groups(data: TransactionModel[]) {
    const groups: TransactionModel[][] = [[]];
    data.forEach((trx) => {
      if (groups.length === 1) {
        groups.push([trx]);
        return;
      }

      const id = Math.floor(trx.timestamp / (3600 * 24));
      const prevId = Math.floor(groups[groups.length - 1][0].timestamp / (3600 * 24));
      if (prevId === id) {
        groups[groups.length - 1].push(trx);
        return;
      }

      groups.push([trx]);
    });

    return groups;
  }

  async refresh() {
    // let start = 0;
    // if (this.list.length >= 3) {
    //   start = this.list[3].timestamp;
    // }

    const trxs = await this.remote.getTransactions({});
    this.user.localStorage.set("transactions", JSON.stringify(trxs));
    runInAction(() => {
      this.isLoading = false;
      this.list = trxs;
    });
  }
}
