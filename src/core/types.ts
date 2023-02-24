export enum TransactionType {
  NONE = "NONE",
  TRANSFER = "TRANSFER",
  CROSS_CHAIN = "CROSS_CHAIN",
  TECHNICAL_REQUEST = "TECHNICAL_REQUEST",
  FUNCTION_CALL = "FUNCTION_CALL",
  DIVIDEND_PAYMENT = "DIVIDEND_PAYMENT",
  NFT_TRANSFER = "NFT_TRANSFER",
  STAKE_UNSTAKE = "STAKE_UNSTAKE",
  TRANSFER_FT = "TRANSFER_FT",
  TRANSFER_PHONE = "TRANSFER_PHONE",
  SWAP = "SWAP",
}

export type TransactionModel = StakeUnstakeModel | DividendPaymentModel;

export interface TransactionData {
  transaction_hash: string;
  signer_account_id?: string;
  signer_public_key?: string;
  from_account_id: string;
  to_account_id: string;
  deposit?: string;
  gas?: string;
  timestamp: number;
  error?: object;
}

export interface StakeUnstakeModel extends TransactionData {
  type: TransactionType.STAKE_UNSTAKE;
  data: {
    amount: number;
    usd_rate: number;
  };
}

export interface DividendPaymentModel extends TransactionData {
  type: TransactionType.DIVIDEND_PAYMENT;
  data: {
    amount: number;
    usd_rate: number;
  };
}

export interface FtToken {
  name: string;
  symbol: string;
  icon: string;
  contract_id: string;
  currency: number;
  token_id: number;
  description: string;
  decimal: number;
  amount: number;
  amount_int: string;
  actions: string;
  usd_rate: number;
  usd_rate_yesterday: number;
}
