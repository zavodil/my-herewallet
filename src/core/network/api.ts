import uuid4 from "uuid4";
import { AnalyticEvent } from "../analytics";
import { Storage } from "../Storage";
import { FtAsset, FtGroup } from "../token/types";
import { TransactionModel } from "../transactions/types";
import { NFTModel, RequestAccessToken } from "./types";

export class HereError extends Error {
  constructor(readonly title: string, readonly body: string) {
    super(body);
  }
}

export class HereApi {
  public readonly endpoint = "https://dev.herewallet.app";
  public readonly storage = new Storage("");

  constructor(readonly jwt = "") {}

  get deviceId() {
    const id = this.storage.get("_deviceid") ?? uuid4();
    this.storage.set("_deviceid", id);
    return id;
  }

  public async request(input: RequestInfo, init: RequestInit & { endpoint?: string } = {}) {
    const end = init.endpoint ?? this.endpoint;
    const res = await fetch(end + input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
        DeviceId: this.deviceId,
        Authorization: this.jwt,
        Network: "mainnet",
      },
    });

    if (res.ok === false) {
      console.log("error", res.url, init.body);
      const msg = await res.text().catch(() => "");
      let error;

      try {
        error = JSON.parse(msg);
      } catch {
        error = { readable_body: msg ?? `Unknown error (${res.status})` };
      }

      throw new HereError(error.readable_title, error.readable_body ?? msg);
    }

    return res;
  }

  public async getNfts(): Promise<NFTModel[]> {
    const res = await this.request("/api/v1/user/nfts");
    const { nfts } = await res.json();
    return nfts;
  }

  async getUser() {
    const res = await this.request(`/api/v1/user`);
    return await res.json();
  }

  async getContacts() {
    const res = await this.request(`/api/v1/user/contacts`);
    const { contacts } = await res.json();
    return contacts;
  }

  async getRate(coin = "NEAR"): Promise<number> {
    const res = await this.request(`/api/v1/rate?currency=${coin}`);
    const { rate } = await res.json();
    return rate;
  }

  async getTotalDividents(account: string): Promise<number> {
    const res = await this.request(`/api/v1/dapp/staking/total_claimed_dividends?account_id=${account}`);
    const { total_claimed_dividends } = await res.json();
    return total_claimed_dividends;
  }

  public async sendEvents(events: AnalyticEvent[]) {
    this.request("/api/v1/user/events", {
      method: "POST",
      body: JSON.stringify({
        device_id: this.deviceId,
        events,
      }),
    });
  }

  async auth(data: RequestAccessToken): Promise<string> {
    const res = await this.request(`/api/v1/user/auth`, {
      body: JSON.stringify(data),
      method: "POST",
    });

    const { token } = await res.json();
    return token;
  }

  async getTokens(): Promise<{ tokens: FtAsset[]; balance_usd: number }> {
    const res = await this.request(`/api/v1/user/tokens`);
    const { tokens, balance_usd } = await res.json();
    return { tokens, balance_usd };
  }

  async getTransactions(): Promise<TransactionModel[]> {
    const res = await this.request(`/api/v1/transactions/t?limit=10`);
    const { transactions } = await res.json();
    return transactions;
  }

  public async getRates(): Promise<Record<string, number[]>> {
    const res = await this.request("/api/v1/rate/tokens");
    const { rates } = await res.json();
    return rates;
  }

  async getAssets(): Promise<{ tokens: FtAsset[]; groups: FtGroup[]; cashback: number | null }> {
    const res = await this.request("/api/v1/user/tokens");
    const { tokens, groups, cashback } = await res.json();
    return { tokens, groups, cashback };
  }
}
