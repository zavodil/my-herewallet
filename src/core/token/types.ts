import { keyBy } from "lodash";

export interface HistoryRate {
  timestamp: number;
  usd_price: number;
}

export enum LegacyChain {
  NEAR = 1,
  NEAR_TESNET = -1,
  POLYGON_TESTNET = -2,
  POLYGON = 2,
  BINANCE = 0,
}

export enum Chain {
  NEAR = 1010,
  NEAR_TESTNET = 1011,
  ETHEREUM = 1020,
  ETHEREUM_GOERLI = 1021,
  BSC = 1030,
  POLYGON = 1040,
  POLYGON_MUMBAI = 1041,
  OPTIMISM = 1050,
  ARBITRUM = 1060,
  AURORA = 1100,
  TRON = 1500,
  BINANCE = 2000,
}

export const chains = [
  {
    id: "BINANCE",
    chain: Chain.BINANCE,
    label: "Binance",
    native: "",
    isMainnet: true,
    binanceId: null,
    eip155: null,
    rpc: null,
  },
  {
    id: "NEAR",
    chain: Chain.NEAR,
    label: "NEAR",
    native: "NEAR",
    binanceId: "NEAR",
    explorer: "https://nearblocks.io/txns/",
    isMainnet: true,
    eip155: null,
    rpc: null,
    decimals: 24,
  },
  {
    id: "NEAR",
    chain: Chain.NEAR_TESTNET,
    explorer: "https://testnet.nearblocks.io/txns/",
    label: "NEAR Testnet",
    native: "NEAR",
    isMainnet: false,
    binanceId: null,
    eip155: null,
    rpc: null,
    decimals: 24,
  },
  {
    id: "POLYGON",
    chain: Chain.POLYGON,
    label: "Polygon",
    binanceId: "MATIC",
    native: "MATIC",
    rpc: "https://polygon.llamarpc.com",
    eip155: 137,
    isMainnet: true,
    decimals: 18,
  },
  {
    id: "POLYGON",
    chain: Chain.POLYGON_MUMBAI,
    label: "Polygon Mumbai",
    native: "MATIC",
    binanceId: null,
    isMainnet: false,
    rpc: "https://polygon-testnet.public.blastapi.io",
    eip155: 80001,
    decimals: 18,
  },
  {
    id: "ETHEREUM",
    chain: Chain.ETHEREUM,
    label: "Ethereum",
    binanceId: "ETH",
    native: "ETH",
    isMainnet: true,
    rpc: "https://eth.llamarpc.com",
    eip155: 1,
    decimals: 18,
  },
  {
    id: "ETHEREUM",
    chain: Chain.ETHEREUM_GOERLI,
    label: "Ethereum Goerli",
    native: "ETH",
    isMainnet: false,
    binanceId: null,
    eip155: 5,
    rpc: null,
    decimals: 18,
  },
  {
    id: "ARBITRUM",
    chain: Chain.ARBITRUM,
    label: "Artbitrum",
    binanceId: "Artbitrum",
    rpc: "https://arbitrum.llamarpc.com",
    eip155: 42161,
    isMainnet: true,
    native: "ETH",
    decimals: 18,
  },
  {
    id: "BSC",
    chain: Chain.BSC,
    label: "Binance Smart Chain",
    binanceId: "BSC",
    rpc: "https://binance.llamarpc.com",
    eip155: 56,
    isMainnet: true,
    native: "BNB",
  },
  {
    id: "OPTIMISM",
    chain: Chain.OPTIMISM,
    label: "Optimism",
    binanceId: "Optimism",
    rpc: "https://optimism.llamarpc.com",
    eip155: 10,
    isMainnet: true,
    native: "ETH",
  },
  {
    id: "AURORA",
    chain: Chain.AURORA,
    label: "Aurora",
    binanceId: null,
    explorer: "https://explorer.aurora.dev/tx/",
    rpc: "https://mainnet.aurora.dev",
    eip155: 1313161554,
    isMainnet: true,
    native: "ETH",
    decimals: 18,
  },
];

export const chainsById = keyBy(chains, "chain");

export interface FtGroup {
  asset: string;
  coingecko_id: string;
  image_url: string;
  is_stable: boolean;
  name: string;
}

export interface FtAsset {
  chain_id?: LegacyChain;
  chain: Chain;
  amount?: string;
  asset: string;
  viewBalance?: number;
  image_url: string;
  gas_free?: boolean;
  coingecko_id: string;
  is_stable: boolean;
  contract_address: string;
  symbol: string;
  name: string;
  decimal: number;
  freeze?: string;
  pending?: string;
}

export interface FtModel {
  id: string;
  chain: Chain;
  asset: string;
  icon: string;
  coingeckoId: string;
  isStable: boolean;
  contract: string;
  symbol: string;
  name: string;
  gasFree: boolean;

  decimal: number;
  freeze: string;
  pending: string;
  viewBalance: number;

  safe: string;
  safeFloat: number;

  amount: string;
  amountFloat: number;
}

export interface FtBalance {
  int: string;
  float: number;
  fiat: number;
  currency: {
    usd: number;
    usd_yesterday: number;
    usd_24h_change: number;
    precision: number;
  };
}

export interface FtMetadata {
  symbol: string;
  image_url: string;
  decimal: number;
  coingecko_id: string;
  is_stable: boolean;
  assets: FtAsset[];
}
