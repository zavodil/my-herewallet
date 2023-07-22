import uuid4 from "uuid4";
import { FtToken, TransactionModel } from "./types";
import { AnalyticEvent } from "./analytics";
import { Storage } from "./UserAccount";

export class HereError extends Error {
  constructor(readonly title: string, readonly body: string) {
    super(body);
  }
}

export class HereApi {
  public readonly endpoint = "https://api.herewallet.app";
  public readonly storage = new Storage("");

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

  async getTokens(): Promise<FtToken[]> {
    const res = await fetch(`https://api.herewallet.app/api/v1/rate/fts`);
    const { fts } = await res.json();
    return fts;
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

  async getStakingTransaction(account: string): Promise<TransactionModel[]> {
    const res = await this.request(`/api/v1/dapp/staking/transactions?account_id=${account}&limit=10`);
    const { transactions } = await res.json();
    return transactions;
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
}
