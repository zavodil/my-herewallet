import { FtToken } from "./types";

export const HERE_STORAGE_DOCS = "https://docs.herewallet.app/technology-description/readme";
export const GOOGLE_PLAY = "https://download.herewallet.app?android";
export const APP_STORE = "https://download.herewallet.app?ios";
export const HERE_STORAGE = "storage.herewallet.near";
export const TGAS = Math.pow(10, 12);
export const SAFE_NEAR = 0.1;

export const defaultToken: FtToken = {
  actions: "",
  contract_id: "near",
  currency: 1,
  decimal: 24,
  description: "",
  icon: "",
  name: "NEAR",
  symbol: "NEAR",
  token_id: 1,
  usd_rate: 1,
  usd_rate_yesterday: 1,
  amount: 0,
  amount_int: "0",
};
