import { HereApi } from "./api";

export interface HereTokenStat {
  amount: string;
  freeze: string;
  pending: string;
  total_claimed_dividends: number;
  base_rate: number;
  apy: number;
}

export interface NearAccessKey {
  public_key: string;
  receiver_id: string | null;
  dapp_name: string;
  preview: string;
  create_ts: number;
}

export class DelegateNotAllowed extends Error {}

class NearApi {
  constructor(private readonly api: HereApi) {}

  async processing(
    tx: string,
    receiver: string,
    signal?: AbortSignal
  ): Promise<{
    success: true;
    error: { readable_title: string; readable_body: string };
  }> {
    const response = await this.api.request(`/api/v1/transactions/processing/${tx}?receiver_id=${receiver}`, {
      signal,
    });
    return await response.json();
  }

  async isCanDelegate(transaction: string, signature: string): Promise<string> {
    const response = await this.api.request("/api/v1/transactions/auth_delegate", {
      body: JSON.stringify({ transaction, signature }),
      method: "POST",
    });

    const { authorization } = await response.json();
    return authorization;
  }

  async sendDelegate(sender_id: string, transaction: string, signature: string, authorisation: string) {
    const response = await fetch("https://relay.herewallet.app/execute", {
      body: JSON.stringify({ sender_id, authorisation, actions: [{ transaction, signature }] }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const { hash } = await response.json();
    return hash;
  }

  public async getNearKeys(): Promise<NearAccessKey[]> {
    const res = await this.api.request("/api/v1/user/near/keys");
    const { keys } = await res.json();
    return keys;
  }

  public async hNearStat(id: string): Promise<HereTokenStat> {
    const res = await this.api.request(`/api/v1/dapp/here/staking/stat?account_id=${id}`);
    return await res.json();
  }

  public async getTransactionError(trx: string, receiver: string): Promise<{ readable_title?: string; readable_body?: string }> {
    const res = await this.api.request(`/api/v1/transactions/error?trx=${trx}&receiver_id=${receiver}`);
    return await res.json();
  }

  public async cancelPending(id: number) {
    await this.api.request(`/api/v1/user/dt/unstake/${id}`, { method: "DELETE" });
  }

  public async pendingUnstake(amount: string) {
    await this.api.request("/api/v1/user/dt/unstake", {
      body: JSON.stringify({ amount }),
      method: "POST",
    });
  }

  public async isExist(address: string): Promise<{ exist: true; user_id: 0; avatar_url: "string" }> {
    const res = await this.api.request(`/api/v1/user/check_account_exist?near_account_id=${address}`);
    return await res.json();
  }

  public async recalcGas(base64: string) {
    const res = await this.api.request("/api/v1/transactions/recalc_gas", {
      body: JSON.stringify({ transaction: base64 }),
      method: "POST",
    });

    const { patches } = await res.json();
    return patches;
  }
}

export default NearApi;
