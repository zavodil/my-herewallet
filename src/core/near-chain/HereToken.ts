import { action, makeObservable, observable, runInAction } from "mobx";
import BN from "bn.js";

import { formatAmount } from "../helpers";
import { NOT_STAKABLE_NEAR, TGAS, getHereStorage } from "./constants";
import { NearAccount } from "./NearAccount";
import StakeTips from "./StakeTips";
import { HereCall } from "@here-wallet/core";
import { Transaction } from "@near-wallet-selector/core";

class HereToken {
  readonly contract = "storage.herewallet.near";
  readonly decimal = 24;

  public isClaiming = false;
  public totalDividends = 0;
  public baseApy = 9.6;
  public apy = 9.6;

  public accrued = 0;
  public unstakable = new BN(0);
  public balance = new BN(0);
  public freeze = new BN(0);
  public pending = new BN(0);
  public safe = new BN(0);
  public tips: StakeTips;

  public contractState = {
    last_accrual_ts: 0,
    apy_value: 0,
    accrued: "0",
  };

  constructor(readonly wallet: NearAccount) {
    makeObservable(this, {
      claimDividents: action,
      unstake: action,
      stake: action,

      apy: observable,
      accrued: observable,
      isClaiming: observable,
      contractState: observable,
      totalDividends: observable,
    });

    this.tips = new StakeTips(wallet);
    this.fetchBalance();
  }

  async cancelPending(id: number) {
    await this.wallet.api.cancelPending(id);
  }

  getAccrued() {
    const timestamp = this.contractState.last_accrual_ts / 1000000;
    const inYear = formatAmount(this.balance.toString()) * (this.contractState.apy_value / 10000);
    const inSec = inYear / 31557600;

    const delta = (Date.now() - timestamp) / 1000;
    const totalApy = delta * inSec;
    return formatAmount(this.contractState.accrued, this.decimal) + totalApy;
  }

  async fetchBalance() {
    const stats = await this.wallet.api.hNearStat(this.wallet.accountId);
    await this.updateContract();

    runInAction(() => {
      this.apy = stats.apy;
      this.baseApy = stats.base_rate;
      this.totalDividends = stats.total_claimed_dividends;
      this.freeze = new BN(stats.freeze);
      this.pending = new BN(stats.pending);
      this.balance = new BN(stats.amount);
      this.unstakable = this.balance.sub(this.pending);
      this.safe = this.balance.sub(this.freeze).sub(this.pending);
      this.accrued = this.getAccrued();
    });
  }

  async updateContract() {
    const contract = await this.wallet.viewFunction({
      contractId: getHereStorage(this.wallet.connection.networkId),
      args: { account_id: this.wallet.accountId },
      methodName: "get_user",
    });

    runInAction(() => {
      this.contractState = contract || { last_accrual_ts: 0, apy_value: 0, accrued: "0" };
    });
  }

  async pendingUnstake(amount: string | BN) {
    await this.fetchBalance();

    amount = new BN(amount);
    const liquid = BN.min(amount, this.safe);
    const pending = amount.sub(liquid);

    if (!pending.isZero()) {
      await this.wallet.api.pendingUnstake(pending.toString());
      if (liquid.isZero()) return null;
    }

    const trx = await this.wallet.functionCall({
      contractId: getHereStorage(this.wallet.connection.networkId),
      args: { amount: liquid.toString() },
      attachedDeposit: new BN("1"),
      methodName: "withdraw",
      gas: new BN(50 * TGAS),
      disableUnstake: true,
    });

    return trx.transaction_outcome.id;
  }

  async unstakeTransaction(amount: string | BN): Promise<Transaction> {
    await this.fetchBalance();
    amount = BN.min(new BN(amount), this.safe);

    return {
      signerId: this.wallet.accountId,
      receiverId: getHereStorage(this.wallet.connection.networkId),
      actions: [
        {
          type: "FunctionCall",
          params: {
            args: { amount: amount.toString() },
            methodName: "withdraw",
            gas: String(50 * TGAS),
            deposit: "1",
          },
        },
      ],
    };
  }

  async unstake(amount: string | BN) {
    await this.fetchBalance();
    amount = BN.min(new BN(amount), this.safe);

    const trx = await this.wallet.functionCall({
      contractId: getHereStorage(this.wallet.connection.networkId),
      args: { amount: amount.toString() },
      attachedDeposit: new BN("1"),
      methodName: "withdraw",
      gas: new BN(50 * TGAS),
      disableUnstake: true,
    });

    return trx.transaction_outcome.id;
  }

  async stake(amount: string | BN) {
    let { available } = await this.wallet.getNativeBalance();
    available = BN.max(new BN(0), available.sub(NOT_STAKABLE_NEAR));
    amount = BN.min(new BN(amount), available);

    const trx = await this.wallet.functionCall({
      contractId: getHereStorage(this.wallet.connection.networkId),
      methodName: "deposit",
      attachedDeposit: amount,
      gas: new BN(50 * TGAS),
      disableUnstake: true,
      args: {},
    });

    return trx.transaction_outcome.id;
  }

  async claimDividents() {
    try {
      if (this.isClaiming) return;
      this.isClaiming = true;
      await this.wallet.functionCall({
        contractId: getHereStorage(this.wallet.connection.networkId),
        methodName: "receive_dividends",
        attachedDeposit: new BN("1"),
        gas: new BN(10 * TGAS),
        args: {},
      });

      action(() => {
        this.isClaiming = false;
        this.totalDividends += this.accrued;
        this.contractState.last_accrual_ts = Date.now() * 1000000;
        this.contractState.accrued = "0";
        this.accrued = 0;
        this.updateContract();
      });
    } catch (e) {
      runInAction(() => (this.isClaiming = false));
      throw e;
    }
  }
}

export default HereToken;
