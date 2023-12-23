import { HereApi } from "./api";
import { CashbackData, TransactionModel } from "../transactions/types";

export interface TransactionsQuery {
  currency?: string;
  limit?: number;
  start?: number;
  chain?: number[] | null;
  onlyFriends?: boolean;
  type?: string[];
  account?: string;
}

class TransactionsApi {
  constructor(readonly api: HereApi) {}

  public async getTransactions(data: TransactionsQuery): Promise<TransactionModel[]> {
    const q = new URLSearchParams();
    q.set("limit", (data.limit || 10).toString());

    if (data.onlyFriends) q.set("only_friends", data.onlyFriends.toString());
    if (data.currency) q.set("currency", data.currency);
    if (data.type?.length) q.set("transaction_type", data.type.join(","));
    if (data.chain?.length) q.set("chain", data.chain.join(","));
    if (data.start) q.set("start", data.start.toString());
    if (data.account) q.set("account_id", data.account);

    const url = `/api/v1/transactions/t?${q}`;
    const res = await this.api.request(url);
    const { transactions } = await res.json();
    return transactions;
  }

  public async patchTransaction(data: {
    transaction_hash: string;
    data: Record<string, string | number>;
    type?: string;
  }) {
    await this.api.request("/api/v1/transactions", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  public async getCashback(): Promise<CashbackData> {
    const res = await this.api.request("/api/v1/user/cashback");
    return await res.json();
  }

  public async claimCashback(): Promise<void> {
    await this.api.request("/api/v1/user/cashback/claim", { method: "POST" });
  }

  public async bindComment(trx: string, comment: string) {
    await this.api.request("/api/v1/transactions/comment", {
      method: "POST",
      body: JSON.stringify({ transaction_hash: trx, comment }),
    });
  }
}

export default TransactionsApi;
