import uuid4 from "uuid4";
import { AnalyticEvent } from "../analytics";
import { Storage } from "../Storage";
import { FtAsset, FtGroup } from "../token/types";
import { TransactionModel } from "../transactions/types";
import { AllocateUsername, NFTModel, RecentlyApps, RequestAccessToken } from "./types";
import { PublicKey } from "near-api-js/lib/utils";
import { isTgMobile } from "../../Mobile";
import { NETWORK } from "../constants";

export class HereError extends Error {
  name = "HereError";
  constructor(readonly title: string, readonly body: string) {
    super(body);
  }
}

export class NetworkError extends Error {
  name = "NetworkError";
  constructor(readonly status: number, readonly title: string, readonly body: string) {
    super(body);
  }
}

export class HereApi {
  public readonly endpoint = isTgMobile() ? "https://dev.herewallet.app" : "https://api.herewallet.app";
  public readonly storage = new Storage("");

  constructor(readonly jwt = "") {}

  get deviceId() {
    const id = this.storage.get("_deviceid");
    if (id == null) this.storage.set("_deviceid", uuid4());
    return this.storage.get("_deviceid")!;
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
        Platform: isTgMobile() ? "telegram" : "web",
        Network: NETWORK,
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

      throw new NetworkError(res.status, error.readable_title, error.readable_body ?? msg);
    }

    return res;
  }

  public async isExist(address: string): Promise<{ exist: true; user_id: 0; avatar_url: "string" }> {
    const res = await this.request(`/api/v1/user/check_account_exist?near_account_id=${address}`);
    return await res.json();
  }

  public async getNfts(): Promise<NFTModel[]> {
    const res = await this.request("/api/v1/user/nfts");
    const { nfts } = await res.json();
    return nfts;
  }

  public async allocateNickname(data: AllocateUsername) {
    await this.request("/api/v1/user/create_near_username", {
      body: JSON.stringify(data),
      method: "POST",
    });
  }

  public async findAccount(publicKey: PublicKey): Promise<string[]> {
    const route = `/api/v1/user/by_public_key?public_key=${publicKey.toString()}`;
    const res = await this.request(route);
    const { users } = await res.json();
    return users;
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

  async getRecentlyApps(): Promise<RecentlyApps[]> {
    const res = await this.request(`/api/v1/transactions/recent_apps`);
    const { apps } = await res.json();
    return apps;
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

  async getTokens(): Promise<{ tokens: FtAsset[]; token_contracts: Record<string, string[]>; balance_usd: number }> {
    const res = await this.request(`/api/v1/user/tokens`);
    return await res.json();
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
