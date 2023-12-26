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

  async refresh() {
    const trxs = await this.remote.getTransactions({
      type: [
        "TRANSFER",
        "CROSS_CHAIN",
        "TECHNICAL_REQUEST",
        "FUNCTION_CALL",
        "DIVIDEND_PAYMENT",
        "NFT_TRANSFER",
        "STAKE_UNSTAKE",
        "TRANSFER_FT",
        "TRANSFER_PHONE",
        "SWAP",
        "ADD_KEY",
        "DELETE_KEY",
        "LINKDROP",
        "SOCIAL_DB",
        "PHONE_SERVICE",
        "CASHBACK",
      ],
    });

    this.user.localStorage.set("transactions", JSON.stringify(trxs));
    runInAction(() => {
      this.isLoading = false;
      this.list = trxs;
    });
  }
}
