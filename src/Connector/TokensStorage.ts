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

export const nearToken = {
  contract_id: "near",
  actions: "",
  amount: 0,
  amount_int: "0",
  currency: 1,
  decimal: 24,
  description: "",
  icon: "",
  name: "NEAR",
  symbol: "NEAR",
  token_id: 1,
  usd_rate: 1,
  usd_rate_yesterday: 1,
};

export const fetchTokens = async () => {
  const res = await fetch(`https://api.herewallet.app/api/v1/user/fts?near_account_id=mydev.near`);
  const { fts } = await res.json();
  return fts;
};
