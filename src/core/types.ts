import BN from "bn.js";

export enum ConnectType {
  Web = "web",
  Ledger = "ledger",
  Here = "here",
  Snap = "snap",
  Local = "local",
}

export interface UserCred {
  type: ConnectType;
  accountId: string;
  publicKey: string;
  path?: string;
  privateKey?: string;
  seed?: string;
  jwt?: string;
}

export interface TransferParams {
  receiver: string;
  amount: string | BN;
  type: "address";
  token: string;
  comment?: string;
}
