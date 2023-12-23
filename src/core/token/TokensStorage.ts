import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { keyBy } from "lodash";
import { BN } from "bn.js";

import { formatAmount, parseAmount } from "../helpers";
import UserAccount from "../UserAccount";
import { FtAsset, FtModel, FtGroup, Chain } from "./types";
import { createToken, ft, tokenId } from "./utils";
import * as defaults from "./defaults";
import Currencies from "./Currencies";
import { NOT_STAKABLE_NEAR } from "../near-chain/constants";

export class TokensStorage {
  public groupsData: Record<string, FtGroup> = {};
  public tokens: Record<string, FtModel> = {};
  public pendingCashback: number | null = 0;
  public isLoading = false;

  constructor(private readonly user: UserAccount) {
    makeObservable(this, {
      stats: computed,
      groupsData: observable,
      isLoading: observable,
      tokens: observable,
      pendingCashback: observable,
      registerToken: action,
      setTokens: action,
    });

    try {
      const fts = JSON.parse(user.localStorage.get("tokens")!);
      this.setTokens(fts, []);
    } catch (e) {}

    const isMain = user.isProduction;
    this.registerToken([
      isMain ? defaults.near : defaults.testnetNear,
      isMain ? defaults.wnear : defaults.testnetWnear,
      defaults.hnear,
      defaults.usdt,
    ]);
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

  /*** Predefined tokens always available */
  get near() {
    return this.tokens[ft(Chain.NEAR, "NEAR")]!;
  }

  get stakableNear() {
    return formatAmount(BN.max(new BN(0), new BN(this.near.safe).sub(NOT_STAKABLE_NEAR)).toString());
  }

  get hnear() {
    return this.tokens[ft(Chain.NEAR, "hNEAR")]!;
  }

  get bnear() {
    return this.tokens[ft(Chain.BINANCE, "NEAR")]!;
  }

  registerToken(assets: FtAsset[]) {
    assets.forEach((asset) => {
      if (this.tokens[tokenId(asset)]) return;
      Currencies.shared.addTickers([asset.coingecko_id]);
      const ft = createToken(asset);
      this.tokens[ft.id] = ft;
    });
  }

  setTokens(fts: FtAsset[], groups: FtGroup[]) {
    this.groupsData = keyBy(groups, (g) => g.asset);

    const newTokens = fts.reduce<Record<string, FtAsset>>((acc, asset) => {
      const token = createToken(asset);
      Currencies.shared.addTickers([token.coingeckoId]);
      this.tokens[token.id] = token;
      acc[token.id] = asset;
      return acc;
    }, {});

    for (const id in this.tokens) {
      if (newTokens[id] == null) {
        this.tokens[id].viewBalance = 0;
        this.tokens[id].amountFloat = 0;
        this.tokens[id].safeFloat = 0;
        this.tokens[id].safe = "0";
        this.tokens[id].amount = "0";
        this.tokens[id].freeze = "0";
        this.tokens[id].pending = "0";
      }
    }

    // TODO: Remove it
    const usdt = this.tokens[Chain.NEAR + "_USDT"];
    if (usdt) usdt.gasFree = true;
  }

  private _lastRefresh = 0;
  async refreshTokens() {
    if (Date.now() - this._lastRefresh < 3000) return;
    this._lastRefresh = Date.now();

    const { tokens, groups, cashback } = await this.user.api.getAssets();
    runInAction(() => (this.pendingCashback = cashback));

    // Костыль под NEAR
    const balance = await this.user.near.getNativeBalance().catch(() => null);
    const nearIndex = tokens.findIndex(
      (t) => [Chain.NEAR, Chain.NEAR_TESTNET].includes(t.chain) && t.symbol === "NEAR"
    );
    if (nearIndex !== -1 && balance != null) {
      const is = false; // this.user.preferences.isHideStorage;
      const storage = balance.total.sub(balance.available);
      tokens[nearIndex].amount = balance.total.toString();
      tokens[nearIndex].freeze = new BN(tokens[nearIndex].freeze ?? "0").add(storage).toString();
      tokens[nearIndex].viewBalance = formatAmount((is ? balance.available : balance.total).toString(), 24, 4);
    }

    this.user.localStorage.set("tokens", JSON.stringify(tokens));
    this.setTokens(tokens, groups);
  }

  find(ids: string[]): FtModel[];
  find(ids: (t: FtModel) => boolean): FtModel;
  find(ids: string[] | ((t: FtModel) => boolean)): any {
    if (typeof ids === "function") return Object.values(this.tokens).find(ids);
    return ids.map((id) => this.tokens[id]).filter((t) => t != null);
  }

  head(fts: FtModel | FtModel[]): FtModel {
    if (!Array.isArray(fts)) return fts;
    if (fts.every((t) => t.id === ft(Chain.NEAR, "NEAR") || t.id === ft(Chain.NEAR, "hNEAR"))) {
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

    // mainnet tokens available only on mainnet, search some token on testnet (01-09)
    // if (chain % 10 === 0 && this.user.target.network !== "mainnet") {
    //   for (let i = 1; i <= 9; i++) {
    //     const asset = this.tokens[ft(chain + i, id)];
    //     if (asset) return asset;
    //   }

    //   return null;
    // }

    return this.tokens[ft(chain, id)] || null;
  }
}
