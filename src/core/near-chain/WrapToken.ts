import BN from "bn.js";
import { FunctionCallAction } from "@here-wallet/core";
import { TGAS, getWrapNear } from "./constants";
import { NearAccount } from "./NearAccount";

class WrapToken {
  readonly decimal = 24;
  readonly contract: string;
  public balance = new BN(0);

  constructor(readonly wallet: NearAccount) {
    this.contract = wallet.connection.networkId === "mainnet" ? "wrap.near" : "wrap.testnet";
    this.fetchBalance();
  }

  isEnought(bn: string | BN) {
    return this.balance.cmp(new BN(bn)) >= 0;
  }

  async adjust(amount: string | BN): Promise<BN> {
    await this.fetchBalance();
    return BN.min(this.balance, new BN(amount));
  }

  async getStorageBalance() {
    return await this.wallet.viewFunction({
      contractId: getWrapNear(this.wallet.connection.networkId),
      methodName: "storage_balance_of",
      args: { account_id: this.wallet.accountId },
    });
  }

  public async safeAction(action: FunctionCallAction) {
    const storage = await this.getStorageBalance().catch(() => null);
    if (storage != null)
      return await this.wallet.callTransaction({
        receiverId: getWrapNear(this.wallet.connection.networkId),
        actions: [action],
      });

    return await this.wallet.callTransaction({
      receiverId: getWrapNear(this.wallet.connection.networkId),
      actions: [
        {
          type: "FunctionCall",
          params: {
            gas: 30 * TGAS,
            methodName: "storage_deposit",
            deposit: "12500000000000000000000",
            args: {
              account_id: this.wallet.accountId,
              registration_only: true,
            },
          },
        },
        action,
      ],
    });
  }

  async wrap(amount: string | BN) {
    const trx = await this.safeAction({
      type: "FunctionCall",
      params: {
        methodName: "near_deposit",
        deposit: amount.toString(),
        gas: 50 * TGAS,
        args: {},
      },
    });

    return trx;
  }

  async fetchBalance() {
    const balance = await this.wallet.viewFunction({
      contractId: this.contract,
      methodName: "ft_balance_of",
      args: { account_id: this.wallet.accountId },
    });

    this.balance = new BN(balance);
  }

  async unwrapAll() {
    await this.fetchBalance();
    return this.unwrap(this.balance);
  }

  async unwrap(amount: string | BN) {
    await this.fetchBalance();
    amount = BN.min(new BN(amount), this.balance);

    const trx = await this.safeAction({
      type: "FunctionCall",
      params: {
        deposit: "1",
        gas: 50 * TGAS,
        methodName: "near_withdraw",
        args: { amount: amount.toString(10) },
      },
    });

    return trx;
  }
}

export default WrapToken;
