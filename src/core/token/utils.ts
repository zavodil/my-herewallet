import { BN } from "bn.js";

import { formatAmount, parseAmount } from "../helpers";
import { Chain, FtAsset, FtModel } from "./types";
import Currencies from "./Currencies";
import tokens from "./tokens";

export enum AssetSymbol {
  NEAR = "NEAR",
  ETH = "ETH",
  WETH = "WETH",
  USDT = "USDT",
  hNEAR = "hNEAR",
  wNEAR = "wNEAR",
  LDNEAR = "LDNEAR",
  STNEAR = "STNEAR",
}

export const copyFloat = (ft: FtModel, float = 1): FtModel => {
  return {
    ...ft,
    freeze: "0",
    pending: "0",
    safeFloat: float,
    amountFloat: float,
    viewBalance: float,
    amount: parseAmount(float, ft.decimal),
    safe: parseAmount(float, ft.decimal),
  };
};

export const copyInt = (ft: FtModel, int = "0"): FtModel => {
  return {
    ...ft,
    freeze: "0",
    pending: "0",
    viewBalance: formatAmount(int, ft.decimal),
    safeFloat: formatAmount(int, ft.decimal),
    amountFloat: formatAmount(int, ft.decimal),
    amount: int,
    safe: int,
  };
};

export const ft = (chain: Chain, id: string) => {
  return chain + "_" + id;
};

export const tokenId = (ft: FtAsset) => {
  return ft.chain + "_" + ft.symbol;
};

export const createToken = (ft: FtAsset): FtModel => {
  const data = tokens[ft.symbol as keyof typeof tokens];
  const chain = data?.chains[ft.chain as 1010 | 2000] || {
    contract_address: ft.contract_address,
    decimal_place: ft.decimal,
  };

  const pending = ft.pending ?? "0";
  const freeze = ft.freeze ?? "0";
  const amount = ft.amount ?? "0";

  const { precision } = Currencies.shared.getCurrency(ft);
  const amountFloat = +formatAmount(amount, ft.decimal, precision);

  let safe = new BN(ft.amount ?? 0)
    .isub(new BN(ft.pending ?? 0))
    .isub(new BN(ft.freeze ?? 0))
    .toString();

  return {
    safe,
    pending,
    freeze,
    amount,
    amountFloat,
    viewBalance: ft.viewBalance ?? amountFloat,
    safeFloat: +formatAmount(safe, ft.decimal, precision),
    gasFree: ft.gas_free ?? false,

    id: tokenId(ft),
    asset: ft.asset,
    name: ft.name,
    symbol: ft.symbol,
    chain: ft.chain,
    contract: chain.contract_address,
    decimal: chain.decimal_place,
    coingeckoId: data?.coingecko_id ?? ft.coingecko_id,
    isStable: data?.is_stable ?? ft.is_stable,
    icon: data?.icon ?? ft.image_url,
  };
};
