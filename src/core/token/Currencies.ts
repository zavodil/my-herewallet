import { action, makeObservable, observable, runInAction, toJS } from "mobx";
import { scientificNotationToString } from "@ref-finance/ref-sdk";

import { wait } from "../helpers";
import { FtAsset, FtModel } from "./types";
import { HereApi } from "../network/api";
import { accounts } from "../Accounts";

interface CurrencyPrice {
  usd: number;
  usd_yesterday: number;
  usd_24h_change: number;
  precision: number;
}

class Currencies {
  static readonly shared = new Currencies();

  public prices: Record<string, CurrencyPrice | undefined> = {};
  public remote = new HereApi("mainnet");

  get api() {
    return accounts.account?.api || this.remote;
  }

  constructor() {
    makeObservable(this, { prices: observable });

    try {
      this.prices = JSON.parse(localStorage.getItem("prices") ?? "{}");
    } catch {}

    this._update();
  }

  private async _update() {
    await this.updatePrices();
    await wait(15000);
    this._update();
  }

  usd(asset: string) {
    return this.prices[asset]?.usd || 0;
  }

  getCurrency(ft: FtModel | FtAsset | null) {
    const empty = { usd: 0, usd_yesterday: 0, usd_24h_change: 0, precision: 2 };
    if (ft == null) return empty;
    return this.prices[ft.asset] || empty;
  }

  getPrecision(price: number) {
    const per = 1 / (price * 100);
    const num = scientificNotationToString(per.toString());
    const [int, float] = num.split(".");
    if (int != null && float != null) {
      if (+int > 0) return 2;

      const v = float.split("").findIndex((t) => +t > 0);
      return Math.max(2, Math.min(8, v));
    }

    return 2;
  }

  private _lastRefresh = 0;
  async updatePrices() {
    if (Date.now() - this._lastRefresh < 5000) return;
    const prices = await this.remote.getRates();

    runInAction(() => {
      Object.entries(prices).forEach(([symbol, prices]) => {
        const [yest = 0, now = yest] = prices as any;
        this.prices[symbol] = {
          precision: this.getPrecision(now),
          usd_24h_change: ((now - yest) / yest) * 100,
          usd_yesterday: yest,
          usd: now,
        };
      });

      localStorage.setItem("prices", JSON.stringify(toJS(this.prices)));
    });
  }
}

export default Currencies;
