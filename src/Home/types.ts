export interface AuthWeb {
  near_account_id: string;
  public_key: string;
  account_sign: string;
  device_id: string;
  msg: string;
  device_name: string;
  nonce: number[];
  web_auth: boolean;
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

export interface FtGroup {
  asset: string;
  coingecko_id: string;
  image_url: string;
  is_stable: boolean;
  name: string;
}

export interface FtAsset {
  chain: Chain;
  coingecko_id: string;
  amount: string;
  pending: string;
  freeze: string;
  image_url: string;
  is_stable: boolean;
  contract_address: string;
  symbol: string;
  name: string;
  decimal: number;
  asset: string;
  usd_rate: number;
}

export interface FtMetadata {
  symbol: string;
  image_url: string;
  decimal: number;
  coingecko_id: string;
  is_stable: boolean;
  assets: FtAsset[];
}

export enum TransactionType {
  NONE = 0,
  TRANSFER = 1,
  CROSS_CHAIN = 2,
  TECHNICAL_REQUEST = 3,
  FUNCTION_CALL = 4,
  DIVIDEND_PAYMENT = 5,
  NFT_TRANSFER = 6,
  STAKE_UNSTAKE = 7,
  TRANSFER_FT = 8,
  TRANSFER_PHONE = 9,
  SWAP = 10,
  ADD_KEY = 11,
  DELETE_KEY = 12,
  CEX = 13,
  SCORE = 14,
  ERROR = 15,
  FIAT = 16,
  LINKDROP = 17,
  LIKE = 18,
  SOCIAL_DB = 19,
  PHONE = 20,
}

export interface TransactionModel {
  hash: string;
  type: "pending" | "success" | "failed";
  timestamp: number;
  badge: {
    icon: string;
    title: string;
    sub_title: string;
    info: string;
    sub_info: string;
    is_income?: boolean;
  };
  metadata: {
    link?: string;
    id: number;
    type: TransactionType;
    [key: string]: number | string | undefined;
  };
  detail: {
    image?: string;
    h1?: string;
    h2?: string;
    title_postfix?: string;
    sub_title: string;
    link?: string;
    link_text?: string;
    button_link?: string;
    info?: string;
    rows: {
      label: string;
      value: string;
      value_right_icon?: string;
      sub_value: string;
      multiline?: boolean;
      hint: string;
    }[];
  };
}
