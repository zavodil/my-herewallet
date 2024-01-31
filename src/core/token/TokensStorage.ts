import { action, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import { BN } from "bn.js";

import { NOT_STAKABLE_NEAR } from "../near-chain/constants";
import { formatAmount } from "../helpers";
import UserAccount from "../UserAccount";

import { NETWORK } from "../constants";
import { isTgMobile } from "../../env";

import * as defaults from "./defaults";
import { FtModel, Chain } from "./types";
import { createToken, ft } from "./utils";
import Currencies from "./Currencies";
import tokens from "./tokens";
import { GAME_ID, GAME_TESTNET_ID } from "../Hot";

export class TokensStorage {
  public tokens: Record<string, FtModel> = {};

  constructor(private readonly user: UserAccount) {
    makeObservable(this, {
      tokens: observable,
      stats: computed,
    });

    this.tokens = user.localStorage.get("tokens:cache2", user.isProduction ? { [defaults.near.id]: createToken(defaults.near) } : { [defaults.testnetNear.id]: createToken(defaults.testnetNear) });

    const defaultsTokens = ["wrap.near", "storage.herewallet.near", "usdt.tether-token.near", GAME_ID];
    this.updateNative();

    if (user.isProduction) {
      this.addContracts(["wrap.near", "storage.herewallet.near", "usdt.tether-token.near", GAME_ID]);
    } else {
      this.addContracts(["wrap.testnet", GAME_TESTNET_ID]);
    }

    if (!isTgMobile()) {
      this.user.api.getTokens().then(
        action((data) => {
          const keys = new Set<string>();
          data.tokens.forEach((t) => {
            const id = ft(t.chain, t.symbol);
            const safe = new BN(t.amount || "0").sub(new BN(t.pending || "")).sub(new BN(t.freeze || "0"));
            keys.add(id);

            this.tokens[ft(t.chain, t.symbol)] = {
              amount: t.amount || "0",
              amountFloat: formatAmount(t.amount || "0", t.decimal),
              asset: t.asset,
              chain: t.chain,
              coingeckoId: t.coingecko_id,
              contract: t.contract_address,
              decimal: t.decimal,
              freeze: t.freeze || "0",
              gasFree: t.gas_free || false,
              icon: t.image_url,
              isStable: t.is_stable,
              name: t.name,
              pending: t.pending || "0",
              safe: safe.toString(),
              safeFloat: formatAmount(safe.toString(), t.decimal),
              viewBalance: formatAmount(safe.toString(), t.decimal),
              symbol: t.symbol,
              id,
            };
          });

          for (let id in this.tokens) {
            if (!keys.has(id) && !defaultsTokens.includes(this.tokens[id].contract)) {
              delete this.tokens[id];
            }
          }

          delete this.tokens[ft(Chain.NEAR, "USDt")];
          this.cacheTokens();
        })
      );
    }
  }

  cacheTokens() {
    this.user.localStorage.set("tokens:cache2", toJS(this.tokens));
  }

  async addContracts(ids: string[]) {
    const list = Object.values(this.tokens);
    ids.forEach(async (id) => {
      const token = list.find((t) => t.contract === id);
      if (token) return await this.updateBalance(token);
      const meta = await this.user.near.viewMethod(id, "ft_metadata");
      runInAction(() => {
        this.tokens[ft(this.nearChain, meta.symbol)] = {
          amount: "0",
          amountFloat: 0,
          asset: meta.symbol,
          chain: this.nearChain,
          // @ts-ignore
          icon: tokens[meta.symbol]?.icon || meta.icon,
          coingeckoId: "",
          contract: id,
          decimal: meta.decimals,
          freeze: "0",
          gasFree: false,
          id: ft(this.nearChain, meta.symbol),
          isStable: false,
          name: meta.symbol,
          pending: "0",
          safe: "0",
          safeFloat: 0,
          symbol: meta.symbol,
          viewBalance: 0,
        };

        this.cacheTokens();
        this.updateBalance(this.tokens[ft(this.nearChain, meta.symbol)]);
      });
    });
  }

  get stats() {
    let all = 0;
    let nears = 0;
    let stables = 0;
    let chains: Partial<Record<Chain, number>> = {};

    for (let id in this.tokens) {
      const ft = this.tokens[id];
      const fiat = this.fiat(ft);
      chains[ft.chain] = (chains[ft.chain] ?? 0) + fiat;
      if (ft.asset === "NEAR") nears += ft.viewBalance;
      if (ft.isStable) stables += fiat;
      all += fiat;
    }

    return { nears, all, chains, stables };
  }

  get nearChain() {
    return NETWORK === "mainnet" ? Chain.NEAR : Chain.NEAR_TESTNET;
  }

  /*** Predefined tokens always available */
  get near() {
    return this.tokens[ft(this.nearChain, "NEAR")]!;
  }

  get hnear() {
    return this.tokens[ft(this.nearChain, "hNEAR")]!;
  }

  get stakableNear() {
    return formatAmount(BN.max(new BN(0), new BN(this.near.safe).sub(NOT_STAKABLE_NEAR)).toString());
  }

  async updateNative() {
    const balance = await this.user.near.getNativeBalance();
    const storage = balance.total.sub(balance.available);
    const ft = this.near;
    if (!ft) return;

    runInAction(() => {
      ft.amount = balance.total.toString();
      ft.amountFloat = formatAmount(ft.amount, ft.decimal);
      ft.freeze = new BN(ft.freeze ?? "0").add(storage).toString();
      ft.safe = balance.available.toString();
      ft.safeFloat = formatAmount(ft.safe, ft.decimal);
      ft.viewBalance = formatAmount(balance.available.toString(), 24, 4);
    });

    this.cacheTokens();
  }

  async updateBalance(id: string | FtModel) {
    const ft = typeof id === "string" ? this.find((t) => t.contract === id) : id;
    const value = await this.user.near.viewMethod(ft.contract, "ft_balance_of", {
      account_id: this.user.near.accountId,
    });

    runInAction(() => {
      this.tokens[ft.id].amount = value;
      this.tokens[ft.id].amountFloat = formatAmount(value, ft.decimal);
      this.tokens[ft.id].safe = this.tokens[ft.id].amount;
      this.tokens[ft.id].safeFloat = this.tokens[ft.id].amountFloat;
      this.tokens[ft.id].viewBalance = this.tokens[ft.id].amountFloat;

      // TODO: force change decimal to avoid cache
      if (ft.symbol === "HOT") {
        this.tokens[ft.id].decimal = 6;
      }
    });

    this.cacheTokens();
  }

  find(ids: string[]): FtModel[];
  find(ids: (t: FtModel) => boolean): FtModel;
  find(ids: string[] | ((t: FtModel) => boolean)): any {
    if (typeof ids === "function") return Object.values(this.tokens).find(ids);
    return ids.map((id) => this.tokens[id]).filter((t) => t != null);
  }

  head(fts: FtModel | FtModel[]): FtModel {
    if (!Array.isArray(fts)) return fts;
    if (fts.every((t) => t.id === ft(this.nearChain, "NEAR") || t.id === ft(this.nearChain, "hNEAR"))) {
      return this.near;
    }

    return fts[0];
  }

  filter(fn: (t: FtModel) => boolean, defToken?: FtModel) {
    const list = Object.values(this.tokens).filter(fn);
    return list.length ? list : defToken ? [defToken] : [];
  }

  usd(ft: string | FtModel) {
    if (typeof ft === "string") ft = this.tokens[ft];
    else ft = this.tokens[ft.id];
    if (ft == null) return 0;
    return Currencies.shared.getCurrency(ft).usd;
  }

  cur(ft: FtModel) {
    return Currencies.shared.getCurrency(ft);
  }

  fiat(ft?: string | FtModel | null) {
    if (typeof ft === "string") ft = this.tokens[ft];
    if (ft == null) return 0;
    return ft.viewBalance * Currencies.shared.getCurrency(ft).usd;
  }

  contract(id: string) {
    return this.find((t) => t.contract === id);
  }

  token(chain: Chain, id: string): FtModel | null {
    // cex tokens available only on mainnet
    if (chain >= 2000) {
      return this.user.isProduction ? this.tokens[ft(chain, id)] || null : null;
    }

    return this.tokens[ft(chain, id)] || null;
  }
}
