import { action, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import { BN } from "bn.js";

import UserAccount from "./UserAccount";
import { TGAS } from "./constants";
import { wait } from "./helpers";
import { NetworkError } from "./network/api";

const GAME_ID = "game.hot-token.near";

interface HotReferral {
  avatar: string;
  account_id: string;
  telegram_username: string;
  hot_balance: number;
  earn_per_hour: number;
}

interface HotState {
  last_claim: number;
  boost_ts_left: number;
  has_refferals: boolean;
  firespace: number;
  storage: number;
  boost: number;
}

const boosters = [
  {
    id: 0,
    title: "Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/1.png"),
  },
  {
    id: 1,
    title: "Storage",

    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/2.png"),
  },
  {
    id: 2,
    title: "Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/3.png"),
  },
  {
    id: 3,
    title: "Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/4.png"),
  },
  {
    id: 4,
    title: "Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/storage/5.png"),
  },
  {
    id: 10,
    title: "Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/1.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 11,
    title: "Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/2.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 12,
    title: "Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/3.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 13,
    title: "Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/4.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 14,
    title: "Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/wood/5.png"),
    mission_text: "Deposit 1 NEAR to account",
  },

  {
    id: 20,
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/1.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 21,
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/2.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 22,
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/3.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 23,
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/4.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
  {
    id: 24,
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    icon: require("../assets/hot/fire/5.png"),
    mission_text: "Deposit 1 NEAR to account",
  },
];

class Hot {
  public currentTime = Date.now();
  public state: HotState | null = null;
  public referrals: HotReferral[] = [];
  public missions: Record<string, boolean> = {};

  public userData = {
    user_id: 0,
    gas_free_transactions: 0,
    near_rpc: "rpc.herewallet.app",
    ft_contracts: [],
  };

  public totalMinted = 0;
  public needRegister = false;

  public levels = [
    { id: 0, hot_price: 0, value: 0 },
    { id: 1, hot_price: 0, value: 0 },
    { id: 2, hot_price: 0, value: 0 },
    { id: 3, hot_price: 0, value: 0 },
    { id: 4, hot_price: 0, value: 0 },
    { id: 10, mission: "", value: 0 },
    { id: 11, mission: "", value: 0 },
    { id: 12, mission: "", value: 0 },
    { id: 13, mission: "", value: 0 },
    { id: 14, mission: "", value: 0 },
    { id: 20, mission: "", value: 0 },
    { id: 21, mission: "", value: 0 },
    { id: 22, mission: "", value: 0 },
    { id: 23, mission: "", value: 0 },
    { id: 24, mission: "", value: 0 },
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

    this.updateStatus();
    this.fetchMissions();
    this.fetchLevels();
    this.fetchReferrals();
    this.getUserData();
    this.getTotalMinted();
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
      const resp = await this.account.api.request(`/api/v1/user/hot?hot_mining_speed=${this.hotPerHour}`);
      const data = await resp.json();
      runInAction(() => (this.userData = data));
      runInAction(() => (this.needRegister = false));
      this.updateCache();
      this.account.tokens.addContracts(this.userData.ft_contracts);
    } catch (e) {
      if (!(e instanceof NetworkError)) return;
      if (e.status !== 404 && e.status !== 400) return;
      runInAction(() => (this.needRegister = true));
    }
  }

  async register() {
    const { user, start_param } = window.Telegram.WebApp?.initDataUnsafe || {};
    await this.account.api.request("/api/v1/user/hot", {
      method: "POST",
      body: JSON.stringify({
        inviter_id: +start_param,
        telegram_username: user?.username,
        telegram_name: [user?.first_name, user?.last_name].filter((t) => t).join(" "),
        telegram_avatar: user?.photo_url,
        telegram_id: user?.id,
      }),
    });

    window.Telegram.WebApp.requestWriteAccess();
    await Promise.all([this.fetchBalance(), this.getUserData(), this.fetchMissions()]);
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

  async claim() {
    await this.account.near.functionCall({ contractId: GAME_ID, methodName: "claim" });
    this.updateStatus();
    this.fetchBalance();
  }

  async completeMission(id: number) {
    await this.account.api.request("/api/v1/user/hot/mission", {
      body: JSON.stringify({ mission_id: id }),
      method: "POST",
    });
    await this.updateStatus();
  }

  get currentBoosters() {
    if (!this.state) return [];
    return [
      this.getBooster(this.state.storage)!,
      this.getBooster(this.state.firespace)!,
      this.getBooster(this.state.boost)!,
    ];
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

    if (booster.hot_price) {
      return this.balance >= booster.hot_price;
    }

    if (booster.mission) {
      return this.missions[booster.mission] || false;
    }

    return false;
  }

  async upgradeBooster(id: number) {
    const booster = this.getBooster(id);
    if (!booster || !this.canUpgrade(id)) return;

    if (booster.hot_price) {
      await this.account.near.functionCall({
        contractId: GAME_ID,
        methodName: "buy_asset",
        gas: new BN(TGAS * 50),
        args: { asset_id: id },
      });

      await this.updateStatus();
      return;
    }

    await this.account.api.request("/api/v1/user/hot/booster", {
      body: JSON.stringify({ asset_id: id }),
      method: "POST",
    });

    await this.updateStatus();
  }

  get balance() {
    const tokens = this.account.tokens;
    return +(tokens.token(tokens.nearChain, "HOT")?.amount || 0);
  }

  get miningProgress() {
    if (!this.state) return 0;
    const spend_ms = this.currentTime - Math.floor(this.state.last_claim / 1000_000);
    return Math.min(1, spend_ms / this.storageCapacityMs);
  }

  get storageCapacityMs() {
    return Math.floor((this.getBooster(this.state?.storage || -1)?.value || 0) / 1_000_000);
  }

  get remainingMiningHours() {
    if (!this.state) return 0;
    const spend_ms = this.currentTime - Math.floor(this.state.last_claim / 1000_000);
    return Math.max(0, (this.storageCapacityMs - spend_ms) / 3600_000).toFixed(2);
  }

  get hotPerHour() {
    if (!this.state) return 0;
    return +this.getBooster(this.state.firespace)!.value * Math.max(1, +this.getBooster(this.state.boost)!.value);
  }

  get earned() {
    return ((this.storageCapacityMs / 3600_000) * this.hotPerHour * this.miningProgress).toFixed(2);
  }

  get referralsEarnPerHour() {
    return this.referrals.reduce((acc, r) => acc + r.earn_per_hour, 0);
  }

  get referralLink() {
    return `t.me/hotisnearbot/app?startapp=${this.userData.user_id}`;
  }
}

export default Hot;
