import BN from "bn.js";
import { Wallet } from "@near-wallet-selector/core";
import { FinalExecutionOutcome, JsonRpcProvider } from "near-api-js/lib/providers";
import { Account, Connection, InMemorySigner } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { SAFE_NEAR, HERE_STORAGE, TGAS, DEFAULT_APY } from "./constants";
import { formatAmount, parseAmount } from "../../helpers";

export class WalletAccount {
  private account: Account;
  readonly provider = new JsonRpcProvider({ url: "https://rpc.herewallet.app" });
  private connection = Connection.fromConfig({
    signer: new InMemorySigner(new InMemoryKeyStore()),
    provider: this.provider,
    jsvmAccountId: "jsvm.mainnet",
    networkId: "mainnet",
  });

  constructor(readonly accountId: string, readonly wallet: Wallet) {
    this.account = new Account(this.connection, this.accountId);
  }

  async getBalance() {
    const hNear = await this.getHereBalance();
    const { available } = await this.account.getAccountBalance();
    return new BN(available).add(new BN(hNear)).toString();
  }

  async getHereBalance(): Promise<string> {
    const props = { account_id: this.accountId };
    const balance = await this.account.viewFunction(HERE_STORAGE, "ft_balance_of", props);
    return balance ?? "0";
  }

  async stakeHere(sum: number | string | BN, callbackUrl?: string) {
    if (sum === "max") {
      const { available } = await this.account.getAccountBalance();
      sum = new BN(available).sub(new BN(parseAmount(SAFE_NEAR)));
    }

    const amount = sum instanceof BN ? sum : new BN(parseAmount(sum.toString()));
    console.log("stakeHere", amount.toString());

    return (await this.wallet.signAndSendTransaction({
      callbackUrl,
      receiverId: HERE_STORAGE,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "deposit",
            deposit: amount.toString(),
            gas: (50 * TGAS).toString(),
            args: {},
          },
        },
      ],
    })) as FinalExecutionOutcome;
  }

  async receiveDividends() {
    return (await this.wallet.signAndSendTransaction({
      receiverId: HERE_STORAGE,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "receive_dividends",
            gas: (50 * TGAS).toString(),
            deposit: "0",
            args: {},
          },
        },
      ],
    })) as FinalExecutionOutcome;
  }

  async unstakeHere(sum: number | string | BN, callbackUrl?: string) {
    console.log(sum);
    if (sum === "max") {
      sum = new BN(await this.getHereBalance());
    }

    const amount = sum instanceof BN ? sum : new BN(parseAmount(sum.toString()));
    console.log(amount.toString());

    return (await this.wallet.signAndSendTransaction({
      callbackUrl,
      receiverId: HERE_STORAGE,
      actions: [
        {
          type: "FunctionCall",
          params: {
            args: { amount: amount.toString() },
            methodName: "withdraw",
            gas: (50 * TGAS).toString(),
            deposit: "1",
          },
        },
      ],
    })) as FinalExecutionOutcome;
  }

  async getState() {
    const { available } = await this.account.getAccountBalance();
    const hNear = await this.getHereBalance();
    const staked = +formatAmount(hNear);
    const unstaked = Math.max(0, +formatAmount(available) - SAFE_NEAR);

    const contract = await this.account.viewFunctionV2({
      contractId: HERE_STORAGE,
      args: { account_id: this.accountId },
      methodName: "get_user",
    });

    if (contract == null) {
      return { apy: DEFAULT_APY, accrued: 0, unstaked, staked };
    }

    const apy = contract.apy_value / 10000;
    const timestamp = contract.last_accrual_ts / 1000000;
    const inYear = staked * apy;
    const inSec = inYear / 31557600;

    const delta = (Date.now() - timestamp) / 1000;
    const accrued = +formatAmount(contract.accrued) + delta * inSec;

    return { apy, accrued, unstaked, staked };
  }
}
