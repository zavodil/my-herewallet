import { action, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import { BN } from "bn.js";

import UserAccount from "./UserAccount";
import { TGAS } from "./constants";
import { formatAmount, parseAmount, wait } from "./helpers";
import { NetworkError } from "./network/api";
import { Chain } from "./token/types";
import { ft } from "./token/utils";

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
  village?: string;
  last_claim: number;
  boost_ts_left: number;
  has_refferals: boolean;
  firespace: number;
  storage: number;
  boost: number;
}

export interface HotVillage {
  name: string;
  avatar: string;
  hot_balance: number;
  total_members: number;
}

const boosters = [
  {
    id: 20,
    title: "Wooden Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    icon: require("../assets/hot/storage/1.png"),
  },
  {
    id: 21,
    title: "Metal Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    icon: require("../assets/hot/storage/2.png"),
  },
  {
    id: 22,
    title: "Modular Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    icon: require("../assets/hot/storage/3.png"),
  },
  {
    id: 23,
    title: "Liquid Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    icon: require("../assets/hot/storage/4.png"),
  },
  {
    id: 24,
    title: "Titanium Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    icon: require("../assets/hot/storage/5.png"),
  },
  {
    id: 10,
    title: "Basic Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    icon: require("../assets/hot/wood/1.png"),
    mission_text: "Download the mobile app and import your account",
  },
  {
    id: 11,
    title: "Neon Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    icon: require("../assets/hot/wood/2.png"),
    mission_text: "Deposit 1+ NEAR on your account",
  },
  {
    id: 12,
    title: "Titanium Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    icon: require("../assets/hot/wood/3.png"),
    mission_text: "Deposit 1 USDT on your account",
  },
  {
    id: 13,
    title: "Jedi Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    icon: require("../assets/hot/wood/4.png"),
    mission_text: "Buy any NFT on NEAR Protocol",
  },
  {
    id: 14,
    title: "Uranium Boxes",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    icon: require("../assets/hot/wood/5.png"),
    mission_text: "Earn 1000+ score in the mobile app",
  },
  {
    id: 0,
    title: "Fireplace",
    text: "Better Fireplace boosts mining speed",
    icon: require("../assets/hot/fire/1.png"),
  },
  {
    id: 1,
    title: "Stone Fireplace",
    text: "Better Fireplace boosts mining speed",
    icon: require("../assets/hot/fire/2.png"),
  },
  {
    id: 2,
    title: "Gas Fireplace",
    text: "Better Fireplace boosts mining speed",
    icon: require("../assets/hot/fire/3.png"),
  },
  {
    id: 3,
    title: "Neon Fireplace",
    text: "Better Fireplace boosts mining speed",
    icon: require("../assets/hot/fire/4.png"),
  },
  {
    id: 4,
    title: "Neon Multy-fireplace",
    text: "Better Fireplace boosts mining speed",
    icon: require("../assets/hot/fire/5.png"),
  },
];

class Hot {
  public currentTime = Date.now();
  public state: HotState | null = null;
  public referrals: HotReferral[] = [];
  public missions: Record<string, boolean> = {
    deposit_1NEAR: false,
    deposit_1USDT: false,
    download_app: false,
    follow_twitter: false,
    telegram_follow: false,
    send_69_hot: false,
  };

  public userData = {
    gas_free_transactions: 0,
    near_rpc: "rpc.mainnet.near.org",
    ft_contracts: [],
    user_id: 0,
  };

  public needRegister = false;
  public validAccountId = "";

  public village: { name: string; avatar: string; hot_balance: number } | null = null;
  public villages: HotVillage[] = [];

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
      village: observable,
      villages: observable,
      balance: computed,
      miningProgress: computed,
      remainingMiningHours: computed,
      hotPerHour: computed,
      earned: computed,
    });

    setInterval(
      action(() => (this.currentTime = Date.now())),
      100
    );

    const cache = this.account.localStorage.get("hot:cache", this.cacheData());
    this.levels = cache.levels;
    this.userData = cache.userData;
    this.missions = cache.missions;
    this.referrals = cache.referrals;
    this.village = cache.village;
    this.state = cache.state;

    this.fetchLevels();
    this.refreshOnchain();
    this.updateStatus().then(() => {
      this.getUserData().then(() => {
        this.fetchMissions();
        this.fetchReferrals();
      });
    });
  }

  async refreshOnchain() {
    await wait(5000);
    await Promise.allSettled([this.fetchLevels(), this.fetchBalance(), this.updateStatus()]);
    this.refreshOnchain();
  }

  cacheData() {
    return toJS({
      levels: this.levels,
      userData: this.userData,
      missions: this.missions,
      referrals: this.referrals,
      village: this.village,
      state: this.state,
    });
  }

  updateCache() {
    this.account.localStorage.set("hot:cache", this.cacheData());
  }

  async updateMyVillage() {
    const villageid = this.state?.village?.split(".")[0];
    if (!villageid) return runInAction(() => (this.village = null));
    const data = await this.getVillage(+villageid);
    runInAction(() => (this.village = data));
    this.updateCache();
  }

  async getVillage(id: number) {
    const resp = await this.account.api.request(`/api/v1/user/hot/village?village_id=${Math.abs(id)}`);
    return await resp.json();
  }

  async joinVillage(id: number) {
    const tx = await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "join_village",
      args: { village: `${Math.abs(id)}.village.hot-token.near` },
    });

    this.updateStatus();
    this.fetchBalance();
    this.action("village", {
      hash: tx.transaction_outcome.id,
      new_village_id: Math.abs(id),
    });
  }

  async getUserData() {
    try {
      const resp = await this.account.api.request(`/api/v1/user/hot?hot_mining_speed=${this.hotPerHourInt}`);
      const data = await resp.json();
      runInAction(() => (this.userData = data));
      this.updateCache();
      this.account.tokens.addContracts(this.userData.ft_contracts);
    } catch (e) {
      if (!(e instanceof NetworkError)) throw e;
      if (e.status !== 404 && e.status !== 400) throw e;
      throw e;
    }
  }

  async register() {
    await this.account.api.request("/api/v1/user/hot", {
      body: JSON.stringify({ telegram_data: window.Telegram.WebApp?.initData }),
      method: "POST",
    });

    await this.updateStatus();
    window.Telegram.WebApp.requestWriteAccess();
    await Promise.all([this.fetchBalance(), this.getUserData(), this.fetchMissions()]);
  }

  action(type: "village", data: { hash: string; old_village_id?: number; new_village_id: number }): Promise<void>;
  action(type: "transfer", data: { hash: string; amount: string; receiver: string }): Promise<void>;
  action(type: "claim", data: { hash: string; amount: string; charge_gas_fee?: boolean }): Promise<void>;
  async action(type: string, data: Record<string, any>) {
    if (type === "transfer" && data.amount === parseAmount(0.69, 6)) {
      this.completeMission("send_69_hot");
    }

    await this.account.api.request(`/api/v1/user/hot/action`, {
      body: JSON.stringify({ type, data }),
      method: "POST",
    });
  }

  async completeMission(mission: string) {
    switch (mission) {
      case "deposit_1NEAR": {
        await this.account.tokens.updateNative();
        if (this.account.tokens.near.amountFloat >= 1) break;
        throw Error("Your NEAR balance has not yet updated.");
      }

      case "deposit_1USDT": {
        await this.account.tokens.updateBalance(ft(Chain.NEAR, "USDT"));
        if ((this.account.tokens.token(Chain.NEAR, "USDT")?.amountFloat || 0) >= 0.95) break;
        throw Error("Your USDT balance has not yet updated.");
      }

      case "deposit_NFT":
      case "install_app":
      case "earn_app_score":
      case "send_69_hot":
      case "telegram_follow":
      case "follow_twitter":
        break;

      default:
        throw Error(`Unknown mission: ${mission}`);
    }

    await this.account.api.request(`/api/v1/user/hot/mission`, {
      body: JSON.stringify({ mission_id: mission }),
      method: "POST",
    });

    await this.fetchMissions();
  }

  async fetchVillages() {
    const resp = await this.account.api.request("/api/v1/user/hot/villages/top");
    const { villages } = await resp.json();
    runInAction(() => (this.villages = villages));
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
    console.log(state);
    if (state == null) {
      runInAction(() => (this.needRegister = true));
      throw Error();
    }

    this.updateCache();
    this.updateMyVillage();
    runInAction(() => {
      this.state = state;
      this.needRegister = false;
    });
  }

  async claim(charge_gas_fee?: boolean) {
    const tx = await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "claim",
      args: { charge_gas_fee },
    });

    this.updateStatus();
    this.fetchBalance();
    this.action("claim", {
      hash: tx.transaction_outcome.id,
      amount: formatAmount(this.earned, 6).toString(),
      charge_gas_fee,
    });

    runInAction(() => {
      if (!this.userData.gas_free_transactions) return;
      this.userData.gas_free_transactions -= 1;
    });
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
      await this.account.api.request("/api/v1/user/hot/mission", { body, method: "POST" });
      await this.updateStatus();
      return;
    }

    await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "buy_asset",
      gas: new BN(TGAS * 50),
      args: { asset_id: id },
    });

    runInAction(() => {
      if (!this.userData.gas_free_transactions) return;
      this.userData.gas_free_transactions -= 1;
    });

    await this.updateStatus();
  }

  get balance() {
    const tokens = this.account.tokens;
    return Math.max(0, +(tokens.token(tokens.nearChain, "HOT")?.amountFloat || 0) + this.earned);
  }

  get intBalance() {
    return new BN(parseAmount(this.balance, 6));
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
    return new BN(this.fireplaceBooster!.value || 0).muln(Math.max(1, +formatAmount(this.woodBoster!.value, 1))).toString();
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
    return `t.me/herewalletbot/app?startapp=${this.userData.user_id}`;
  }
}

export default Hot;
