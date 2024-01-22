import { AssetSymbol, ft } from "./utils";
import { Chain } from "./types";

export const ethAurora = {
  amount: "0",
  decimal: 18,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "ETH",
  name: "ETH",
  is_stable: true,
  coingecko_id: "ethereum",
  symbol: AssetSymbol.ETH,
  chain: Chain.AURORA,
  contract_address: "",
  id: ft(Chain.AURORA, AssetSymbol.ETH),
};

export const wethAurora = {
  amount: "0",
  decimal: 18,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "WETH",
  name: "wETH",
  is_stable: true,
  coingecko_id: "ethereum",
  symbol: AssetSymbol.WETH,
  chain: Chain.AURORA,
  contract_address: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  id: ft(Chain.AURORA, AssetSymbol.WETH),
};

export const usdt = {
  amount: "0",
  decimal: 6,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "USDT",
  name: "USDT",
  is_stable: true,
  coingecko_id: "tether",
  symbol: AssetSymbol.USDT,
  chain: Chain.NEAR,
  contract_address: "usdt.tether-token.near",
  id: ft(Chain.NEAR, AssetSymbol.USDT),
};

export const near = {
  amount: "0",
  decimal: 24,
  freeze: "0",
  pending: "0",
  image_url: "https://assets.coingecko.com/coins/images/10365/large/near.png?1677061777",
  asset: "NEAR",
  name: "NEAR",
  is_stable: false,
  coingecko_id: "near",
  symbol: AssetSymbol.NEAR,
  chain: Chain.NEAR,
  contract_address: "",
  id: ft(Chain.NEAR, AssetSymbol.NEAR),
};

export const testnetHot = {
  amount: "0",
  decimal: 0,
  freeze: "0",
  pending: "0",
  image_url: require("../../assets/hot/hot-icon.png"),
  asset: "HOT",
  name: "HOT",
  is_stable: false,
  coingecko_id: "???",
  symbol: "HOT",
  chain: Chain.NEAR,
  contract_address: "game.hot-token.testnet",
  id: ft(Chain.NEAR, "HOT"),
};

export const hot = {
  amount: "0",
  decimal: 0,
  freeze: "0",
  pending: "0",
  image_url: require("../../assets/hot/hot-icon.png"),
  asset: "HOT",
  name: "HOT",
  is_stable: false,
  coingecko_id: "???",
  symbol: "HOT",
  chain: Chain.NEAR,
  contract_address: "game.hot-token.near",
  id: ft(Chain.NEAR, "HOT"),
};

export const testnetNear = {
  amount: "0",
  decimal: 24,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "NEAR",
  name: "NEAR",
  is_stable: false,
  coingecko_id: "near",
  symbol: AssetSymbol.NEAR,
  chain: Chain.NEAR_TESTNET,
  id: ft(Chain.NEAR_TESTNET, AssetSymbol.NEAR),
  contract_address: "",
};

export const hnear = {
  amount: "0",
  decimal: 24,
  freeze: "0",
  pending: "0",
  image_url: "",
  is_stable: false,
  asset: "NEAR",
  name: "HERE Earn",
  coingecko_id: "near",
  chain: Chain.NEAR,
  symbol: AssetSymbol.hNEAR,
  contract_address: "storage.herewallet.near",
  id: ft(Chain.NEAR, AssetSymbol.hNEAR),
};

export const wnear = {
  amount: "0",
  decimal: 24,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "NEAR",
  name: "wNEAR",
  is_stable: false,
  coingecko_id: "near",
  chain: Chain.NEAR,
  symbol: AssetSymbol.wNEAR,
  contract_address: "wrap.near",
  id: ft(Chain.NEAR, AssetSymbol.wNEAR),
};

export const testnetWnear = {
  amount: "0",
  decimal: 24,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "NEAR",
  name: "wNEAR",
  is_stable: false,
  coingecko_id: "near",
  chain: Chain.NEAR_TESTNET,
  symbol: AssetSymbol.wNEAR,
  contract_address: "wrap.testnet",
  id: ft(Chain.NEAR_TESTNET, AssetSymbol.wNEAR),
};

export const bnear = {
  amount: "0",
  decimal: 8,
  freeze: "0",
  pending: "0",
  image_url: "",
  asset: "NEAR",
  name: "Binance NEAR",
  is_stable: false,
  contract_address: "",
  coingecko_id: "near",
  chain: Chain.BINANCE,
  symbol: AssetSymbol.NEAR,
  id: ft(Chain.BINANCE, AssetSymbol.NEAR),
};
