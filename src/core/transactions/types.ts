import { Chain } from "../token/types";

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

export interface CashbackData {
  claim_date: number;
  claim_available: boolean;
  need_verification: "binance" | null;
  transactions: (TransactionModel & { metadata: { paid: boolean; amount: number } })[];
}

export interface TransactionModel {
  hash: string;
  chain_id: Chain;
  type: "pending" | "success" | "failed" | "cancelled";
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
