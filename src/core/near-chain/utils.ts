import { Action, HereCall } from "@here-wallet/core";
import { ExecutionOutcome, ExecutionStatusBasic, Provider } from "near-api-js/lib/providers/provider";
import { providers, transactions } from "near-api-js";
import { BN } from "bn.js";

import { parseAmount } from "../helpers";

export const TGAS = Math.pow(10, 12);
export const SAFE_NEAR = new BN(parseAmount(0.01));
export const NOT_STAKABLE_NEAR = new BN(parseAmount(0.25));
export const ONE_NEAR = new BN(1).pow(new BN(24));

export const MaxGasPerTransaction = TGAS * 300;
export const StorageCostPerByte = new BN(10).pow(new BN(19));

export const wait = (timeout: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout));
};

export function parseNearOfActions(actions: Action[]) {
  return actions.reduce((bn, action) => {
    if (action.type === "FunctionCall") return bn.add(new BN(action.params.deposit));
    if (action.type === "Transfer") return bn.add(new BN(action.params.deposit));
    return bn;
  }, new BN(0));
}

export function parseNearOfTransactions(transactions: HereCall[]) {
  return transactions.reduce((bn, trx) => bn.add(parseNearOfActions(trx.actions)), new BN(0));
}

export const waitTransactionResult = async (
  txHash: string,
  accountId: string,
  provider: Provider,
  attemps = 0,
  signal?: AbortSignal
): Promise<providers.FinalExecutionOutcome> => {
  if (signal?.aborted) throw Error("Aborted");

  if (attemps > 10) {
    return await provider.txStatus(txHash, accountId);
  }

  await wait(2000);
  if (signal?.aborted) throw Error("Aborted");

  let logs: providers.FinalExecutionOutcome;
  try {
    logs = await provider.txStatus(txHash, accountId);
  } catch {
    if (signal?.aborted) throw Error("Aborted");
    return await waitTransactionResult(txHash, accountId, provider, attemps + 1, signal);
  }

  const errors: any[] = [];
  const trxOutcome = logs.transaction_outcome.outcome;
  const receipts = logs.receipts_outcome.reduce((acc: Record<string, ExecutionOutcome>, item) => {
    acc[item.id] = item.outcome;
    return acc;
  }, {});

  const checkReceipts = (ids: string[]): boolean => {
    return ids.some((id) => {
      if (!receipts[id]) return false;
      const { status } = receipts[id];

      if (typeof status === "string") {
        if (status === ExecutionStatusBasic.Failure) errors.push(status);
        return false;
      }

      if (status.Failure) {
        errors.push(status.Failure);
        return false;
      }

      if (typeof status.SuccessValue === "string") {
        if (receipts[id].receipt_ids.length === 0) return true;
      }

      return checkReceipts(receipts[id].receipt_ids);
    });
  };

  const isSuccess = checkReceipts(trxOutcome.receipt_ids);
  if (errors.length > 0) throw Error(JSON.stringify(errors, null, 2));

  if (isSuccess) return logs;
  return await waitTransactionResult(txHash, accountId, provider, attemps + 1, signal);
};

export class Queue {
  _items: any[] = [];
  enqueue(item: any) {
    this._items.push(item);
  }

  dequeue() {
    return this._items.shift();
  }

  get size() {
    return this._items.length;
  }
}

export class AutoQueue extends Queue {
  _pendingPromise = false;
  enqueue<T>(action: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      super.enqueue({ action, resolve, reject });
      void this.dequeue();
    });
  }

  async dequeue() {
    if (this._pendingPromise) return false;
    let item = super.dequeue();
    if (!item) return false;

    try {
      this._pendingPromise = true;
      let payload = await item.action(this);
      this._pendingPromise = false;
      item.resolve(payload);
    } catch (e) {
      this._pendingPromise = false;
      item.reject(e);
    } finally {
      void this.dequeue();
    }

    return true;
  }
}

export const actionsToHereCall = (actions: transactions.Action[]): Action[] => {
  const acts = actions.map<Action | null>((act) => {
    if (act.addKey) {
      const perms = act.addKey.accessKey.permission;
      return {
        type: "AddKey",
        params: {
          publicKey: act.addKey.publicKey.toString(),
          accessKey: {
            permission: perms.fullAccess
              ? "FullAccess"
              : {
                  receiverId: perms.functionCall?.receiverId ?? "",
                  allowance: perms.functionCall?.allowance?.toString(),
                  methodNames: perms.functionCall?.methodNames ?? [],
                },
          },
        },
      };
    }

    if (act.createAccount) {
      return { type: "CreateAccount", params: {} };
    }

    if (act.deleteAccount) {
      return { type: "DeleteAccount", params: { beneficiaryId: act.deleteAccount.beneficiaryId } };
    }

    if (act.deleteKey) {
      return { type: "DeleteKey", params: { publicKey: act.deleteKey.publicKey.toString() } };
    }

    if (act.transfer) {
      return { type: "Transfer", params: { deposit: act.transfer.deposit.toString() } };
    }

    if (act.stake) {
      return {
        type: "Stake",
        params: { publicKey: act.stake.publicKey.toString(), stake: act.stake.stake.toString() },
      };
    }

    if (act.deployContract) {
      return { type: "DeployContract", params: { code: act.deployContract.code } };
    }

    if (act.functionCall) {
      return {
        type: "FunctionCall",
        params: {
          methodName: act.functionCall.methodName,
          args: Buffer.from(act.functionCall.args).toString("base64"),
          deposit: act.functionCall.deposit.toString(),
          gas: act.functionCall.gas.toString(),
        },
      };
    }

    return null;
  });

  return acts.filter((t): t is Action => t != null);
};
