import BN from "bn.js";
import {PublicKey} from "@near-js/crypto";

export enum ConnectType {
  Web = "web",
  Ledger = "ledger",
  Here = "here",
  Snap = "snap",
  Local = "local",
  WalletConnect = "wallet-connect",
}

export interface UserCred {
  type: ConnectType;
  accountId: string;
  publicKey: string;
  path?: string;
  privateKey?: string;
  referalId?: string;
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

export interface AddKeyParams {
  publicKey: string | PublicKey;
  contractId?: string;
  methodNames?: string | string[];
  amount?: BN
}
