import { BN } from "bn.js";
import { parseNearAmount } from "near-api-js/lib/utils/format";

export const MAINNET = "mainnet";
export const TESTNET = "testnet";

export const TGAS = Math.pow(10, 12);
export const SAFE_NEAR = new BN(parseNearAmount("0.01")!);
export const NOT_STAKABLE_NEAR = new BN(parseNearAmount("0.25")!);
export const ONE_NEAR = new BN(1).pow(new BN(24));

export const MaxGasPerTransaction = TGAS * 300;
export const StorageCostPerByte = new BN(10).pow(new BN(19));

export const NEAR_DOMAINS = [".near", ".sweat", ".usn", ".tg"];

export const getNodeUrl = (network: string) => {
  switch (network) {
    case TESTNET:
      return "https://rpc.testnet.near.org";
    case MAINNET:
      return "https://rpc.mainnet.near.org";
    default:
      return "https://rpc.mainnet.near.org";
  }
};

export const getNicknamePostfix = (network: string) => {
  switch (network) {
    case TESTNET:
      return ".testnet";
    case MAINNET:
      return ".near";
    default:
      return "";
  }
};

export const getHereStorage = (network: string) => {
  switch (network) {
    case TESTNET:
      return "storage.herewallet.testnet";
    case MAINNET:
      return "storage.herewallet.near";
    default:
      return "";
  }
};

export const getWrapNear = (network: string) => {
  switch (network) {
    case TESTNET:
      return "wrap.testnet";
    case MAINNET:
      return "wrap.near";
    default:
      return "";
  }
};
