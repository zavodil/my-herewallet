import uuid4 from "uuid4";
import { AuthWeb, FtAsset, TransactionModel } from "./types";

export class HereError extends Error {
  constructor(readonly title: string, readonly body: string) {
    super(body);
  }
}

export class HereApi {
  public readonly endpoint = "https://dev.herewallet.app";
  private authToken = "";

  setToken(jwt: string | null) {
    this.authToken = jwt || "";
  }

  get deviceId() {
    const id = window.localStorage.getItem("_deviceid") ?? uuid4();
    window.localStorage.setItem("_deviceid", id);
    return id;
  }

  public async request(input: RequestInfo, init: RequestInit & { endpoint?: string } = {}) {
    const end = init.endpoint ?? this.endpoint;
    const res = await fetch(end + input, {
      ...init,
      headers: {
        ...init?.headers,
        DeviceId: this.deviceId,
        Authorization: this.authToken,
        "Content-Type": "application/json",
        Network: "mainnet",
      },
    });

    if (res.ok === false) {
      console.log("error", res.url, init.body);
      const { detail } = await res.json().catch(() => ({ detail: "" }));
      throw new HereError("Server error", detail);
    }

    return res;
  }

  async auth(data: AuthWeb): Promise<string> {
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
}
