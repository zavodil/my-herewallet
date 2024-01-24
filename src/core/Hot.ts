import { action, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import { BN } from "bn.js";

import UserAccount from "./UserAccount";
import { TGAS } from "./constants";
import { formatAmount, wait } from "./helpers";
import { NetworkError } from "./network/api";

export const GAME_ID = "game.hot-token.near";
export const GAME_TESTNET_ID = "game.hot-token.testnet";

export interface HotReferral {
  avatar: string;
  account_id: string;
  telegram_username: string;
  hot_balance: number;
  earn_per_hour: number;
}

export interface HotState {
  last_claim: number;
  boost_ts_left: number;
  has_refferals: boolean;
  firespace: number;
  storage: number;
  boost: number;
}

const boosters = [
  {
    id: 20,
    title: "Wooden Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/1.png"),
  },
  {
    id: 21,
    title: "Metal Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/2.png"),
  },
  {
    id: 22,
    title: "Modular Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/3.png"),
  },
  {
    id: 23,
    title: "Liquid Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/4.png"),
  },
  {
    id: 24,
    title: "Titanium Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/5.png"),
  },
  {
    id: 10,
    title: "Basic Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/1.png"),
    mission_text: "Download the mobile app and import your account",
  },
  {
    id: 11,
    title: "Neon Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/2.png"),
    mission_text: "Deposit 1+ NEAR on your account",
  },
  {
    id: 12,
    title: "Titanium Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/3.png"),
    mission_text: "Deposit 1 USDT on your account",
  },
  {
    id: 13,
    title: "Jedi Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/4.png"),
    mission_text: "Buy any NFT on NEAR Protocol",
  },
  {
    id: 14,
    title: "Uranium Boxes",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/5.png"),
    mission_text: "Earn 1000+ score in the mobile app",
  },
  {
    id: 0,
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/1.png"),
  },
  {
    id: 1,
    title: "Stone Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/2.png"),
  },
  {
    id: 2,
    title: "Gas Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/3.png"),
  },
  {
    id: 3,
    title: "Neon Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/4.png"),
  },
  {
    id: 4,
    title: "Neon Multy-fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/5.png"),
  },
];

class Hot {
  public currentTime = Date.now();
  public state: HotState | null = null;
  public referrals: HotReferral[] = [
    {
      account_id: "azbang.near",
      avatar: "",
      earn_per_hour: 20,
      hot_balance: 1000,
      telegram_username: "Andrey Zhevlakov",
    },
  ];

  public missions: Record<string, boolean> = {
    deposit_1NEAR: false,
    deposit_1USDT: false,
    download_app: false,
    follow_twitter: false,
    telegram_follow: false,
    send_69_hot: false,
  };

  public userData = {
    user_id: 0,
    gas_free_transactions: 0,
    near_rpc: "rpc.herewallet.app",
    ft_contracts: [],
  };

  public totalMinted = 0;
  public needRegister = false;

  public levels = [
    { id: 0, hot_price: 0, value: "0" },
    { id: 1, hot_price: 0, value: "0" },
    { id: 2, hot_price: 0, value: "0" },
    { id: 3, hot_price: 0, value: "0" },
    { id: 4, hot_price: 0, value: "0" },
    { id: 10, mission: "", value: "0" },
    { id: 11, mission: "", value: "0" },
    { id: 12, mission: "", value: "0" },
    { id: 13, mission: "", value: "0" },
    { id: 14, mission: "", value: "0" },
    { id: 20, hot_price: 0, value: "0" },
    { id: 21, hot_price: 0, value: "0" },
    { id: 22, hot_price: 0, value: "0" },
    { id: 23, hot_price: 0, value: "0" },
    { id: 24, hot_price: 0, value: "0" },
  ];

  constructor(readonly account: UserAccount) {
    makeObservable(this, {
      state: observable,
      currentTime: observable,
      referrals: observable,
      missions: observable,
      levels: observable,
      balance: computed,
      miningProgress: computed,
      remainingMiningHours: computed,
      hotPerHour: computed,
      earned: computed,
    });

    setInterval(
      action(() => (this.currentTime = Date.now())),
      1000
    );

    const cache = this.account.localStorage.get("hot:cache", this.cacheData());
    this.levels = cache.levels;
    this.userData = cache.userData;
    this.missions = cache.missions;
    this.referrals = cache.referrals;
    this.state = cache.state;

    this.getUserData().then(() => {
      this.getTotalMinted();
      this.updateStatus();
      this.fetchMissions();
      this.fetchLevels();
      this.fetchReferrals();
    });
  }

  cacheData() {
    return toJS({
      levels: this.levels,
      userData: this.userData,
      missions: this.missions,
      referrals: this.referrals,
      totalMinted: this.totalMinted,
      state: this.state,
    });
  }

  updateCache() {
    this.account.localStorage.set("hot:cache", this.cacheData());
  }

  async getTotalMinted() {
    const balance = await this.account.near.viewMethod(GAME_ID, "ft_total_supply").catch(() => this.totalMinted);
    runInAction(() => (this.totalMinted = balance));
    this.updateCache();
    await wait(10000);
    await this.getTotalMinted();
  }

  async getUserData() {
    try {
      const resp = await this.account.api.request(`/api/v1/user/hot?hot_mining_speed=${this.hotPerHourInt}`);
      const data = await resp.json();
      runInAction(() => (this.userData = data));
      runInAction(() => (this.needRegister = false));
      this.updateCache();
      this.account.tokens.addContracts(this.userData.ft_contracts);
    } catch (e) {
      if (!(e instanceof NetworkError)) throw e;
      if (e.status !== 404 && e.status !== 400) throw e;
      runInAction(() => (this.needRegister = true));
      throw e;
    }
  }

  async register() {
    await this.account.api.request("/api/v1/user/hot", {
      body: JSON.stringify({ telegram_data: window.Telegram.WebApp?.initData }),
      method: "POST",
    });

    window.Telegram.WebApp.requestWriteAccess();
    await Promise.allSettled([this.fetchBalance(), this.getUserData(), this.updateStatus(), this.fetchMissions()]);
  }

  async fetchMissions() {
    const resp = await this.account.api.request("/api/v1/user/hot/missions");
    const data = await resp.json();
    runInAction(() => (this.missions = data));
    this.updateCache();
  }

  async fetchReferrals() {
    const resp = await this.account.api.request("/api/v1/user/hot/referrals");
    const data = await resp.json();
    runInAction(() => (this.referrals = data.referrals));
    this.updateCache();
  }

  async fetchBalance() {
    await this.account.tokens.updateBalance(GAME_ID);
  }

  async fetchLevels() {
    const near = this.account.near;
    const state = await near.viewMethod(GAME_ID, "get_assets", { account_id: near.accountId });
    runInAction(() => (this.levels = state));
    this.updateCache();
  }

  async updateStatus() {
    const state = await this.account.near.viewMethod(GAME_ID, "get_user", { account_id: this.account.near.accountId });
    runInAction(() => (this.state = state));
    this.updateCache();
  }

  async claim(charge_gas_fee?: boolean) {
    await this.account.near.functionCall({ contractId: GAME_ID, methodName: "claim", args: { charge_gas_fee } });
    this.updateStatus();
    this.fetchBalance();
  }

  isFireplace(id: number) {
    return id < 10 && id >= 0;
  }

  isWood(id: number) {
    return id < 20 && id >= 10;
  }

  isStorage(id: number) {
    return id < 30 && id >= 20;
  }

  get fireplaceBooster() {
    return this.getBooster(this.state?.firespace || 0);
  }

  get storageBooster() {
    return this.getBooster(this.state?.storage || 20);
  }

  get woodBoster() {
    return this.getBooster(this.state?.boost || 10);
  }

  getBooster(id: number) {
    const level = this.levels.find((lvl) => lvl.id === id)!;
    if (!level) return null;
    const metadata = boosters.find((b) => b.id === id)!;
    if (!metadata) return null;
    return { ...metadata, ...level };
  }

  canUpgrade(id: number) {
    const booster = this.getBooster(id);
    if (!booster) return false;

    if (booster.mission) {
      return this.missions[booster.mission] || false;
    }

    return this.intBalance.gte(new BN(booster.hot_price || 0));
  }

  async upgradeBooster(id: number) {
    const booster = this.getBooster(id);
    if (!booster || !this.canUpgrade(id)) return;

    if (booster.mission) {
      const body = JSON.stringify({ asset_id: id });
      await this.account.api.request("/api/v1/user/hot/booster", { body, method: "POST" });
      await this.updateStatus();
      return;
    }

    await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "buy_asset",
      gas: new BN(TGAS * 50),
      args: { asset_id: id },
    });

    await this.updateStatus();
  }

  get balance() {
    const tokens = this.account.tokens;
    return +(tokens.token(tokens.nearChain, "HOT")?.amountFloat || 0);
  }

  get intBalance() {
    const tokens = this.account.tokens;
    return new BN(tokens.token(tokens.nearChain, "HOT")?.amount || 0);
  }

  get miningProgress() {
    if (!this.state) return 0;
    const spend_ms = this.currentTime - Math.floor(this.state.last_claim / 1000_000);
    return Math.min(1, spend_ms / this.storageCapacityMs);
  }

  storageCapacityHours(id: number) {
    return +(+(this.getBooster(id)?.value || 0) / 3600_000_000_000).toFixed(2);
  }

  get storageCapacityMs() {
    return Math.floor(+(this.storageBooster?.value || 0) / 1_000_000);
  }

  get remainingMiningHours() {
    if (!this.state) return 0;
    const spend_ms = this.currentTime - Math.floor(this.state.last_claim / 1000_000);
    return Math.max(0, (this.storageCapacityMs - spend_ms) / 3600_000).toFixed(2);
  }

  get hotPerHourInt() {
    if (!this.state) return "0";
    return new BN(this.fireplaceBooster!.value || 0).muln(Math.max(1, +this.woodBoster!.value)).toString();
  }

  get hotPerHour() {
    if (!this.state) return 0;
    return +formatAmount(this.hotPerHourInt.toString(), 6).toFixed(6);
  }

  get earned() {
    return +((this.storageCapacityMs / 3600_000) * this.hotPerHour * this.miningProgress).toFixed(6);
  }

  get referralsEarnPerHour() {
    return this.referrals.reduce((acc, r) => acc + formatAmount(r.earn_per_hour, 6) * 0.2, 0);
  }

  get referralLink() {
    return `t.me/hotisnearbot/app?startapp=${this.userData.user_id}`;
  }
}

export default Hot;
