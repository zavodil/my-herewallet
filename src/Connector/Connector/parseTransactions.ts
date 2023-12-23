import { BN } from "bn.js";
import { FunctionCallAction, Transaction } from "@here-wallet/core";
import { formatAmount } from "../../core/helpers";
import { near } from "../../core/token/defaults";
import { FtModel } from "../../core/token/types";

export const parseArgs = (data: string | Object) => {
  if (typeof data !== "string") return data;

  try {
    const json = Buffer.from(data, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return data;
  }
};

export const parseFunctionCall = (contract: string, action: FunctionCallAction, tokens: FtModel[]) => {
  const Tgas = +formatAmount(action.params.gas.toString(), 12);
  const nearToken = tokens.find((t) => t.symbol === "NEAR") ?? near;
  const nearAmount = +formatAmount(action.params.deposit, nearToken.decimal);
  const nearGas = +formatAmount(action.params.gas.toString(), nearToken.decimal);

  const ft = tokens.find((t) => t.contract_id === contract);
  const ftAmountRaw = (parseArgs(action.params.args) as Record<string, string>).amount;
  if (ftAmountRaw != null && ft != null) {
    const ftAmount = +formatAmount(ftAmountRaw, ft.decimal);
    return { ft, ftAmount, nearAmount, nearToken, nearGas, Tgas };
  }

  return { nearToken, nearAmount, Tgas, nearGas };
};

export function parseTotalAmountOfTransactions(transactions: Transaction[], tokens: FtModel[]) {
  const nearToken = tokens.find((t) => t.symbol === "NEAR") ?? near;
  const total = transactions.reduce((acc, trx) => {
    return trx.actions.reduce((bn, action) => {
      switch (action.type) {
        case "FunctionCall": {
          const { ft, nearToken, nearAmount, ftAmount, nearGas } = parseFunctionCall(
            trx.receiverId ?? "",
            action,
            tokens
          );

          let total = nearAmount * nearToken.usd_rate + nearGas * nearToken.usd_rate;
          if (ft != null && ftAmount != null) {
            total += ftAmount * ft.usd_rate;
          }

          return total;
        }

        case "Stake": {
          return +formatAmount(action.params.stake, nearToken.decimal) * nearToken.usd_rate;
        }

        case "Transfer": {
          return +formatAmount(action.params.deposit, nearToken.decimal) * nearToken.usd_rate;
        }

        default:
          return bn;
      }
    }, acc);
  }, 0);

  return (+total).toFixed(2);
}

export function parseNearOfTransactions(transactions: Transaction[]) {
  const defaultGas = new BN(30000000000000); // 300 TGas
  return transactions.reduce((acc, trx) => {
    return trx.actions.reduce((bn, action) => {
      switch (action.type) {
        case "FunctionCall": {
          return bn.add(new BN(action.params.deposit)).add(new BN(action.params.gas ?? defaultGas));
        }

        case "Stake": {
          return bn.add(new BN(action.params.stake)).add(defaultGas);
        }

        case "Transfer": {
          return bn.add(new BN(action.params.deposit)).add(defaultGas);
        }

        default:
          return bn.add(defaultGas);
      }
    }, acc);
  }, new BN(0));
}
