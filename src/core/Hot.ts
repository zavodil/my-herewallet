import { action, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import { BN } from "bn.js";

import UserAccount from "./UserAccount";
import { HotReferral, HotState, HotVillage, boosters } from "./configs/hot";
import { formatAmount, parseAmount, wait } from "./helpers";
import { TGAS } from "./constants";

export const GAME_ID = "game.hot.tg";
export const GAME_TESTNET_ID = "game.hot-token.testnet";

export const getStartParam = () => {
  const data = window.Telegram?.WebApp?.initDataUnsafe || {};
  const value: string = data.start_param?.toString?.();
  if (!value) return {};

  if (value.startsWith("village:")) return { village: value.replace("village:", "") };
  if (+value < 0) return { village: Math.abs(+value).toString() };

  if (value === "read_storage") return { other: "read_storage" };

  if (data.user?.id?.toString() === value) return {};
  return { ref: value };
};

class Hot {
  public currentTime = Date.now();
  public state: HotState | null = null;

  public referralsEarn = 0;
  public referralsTotal = 0;
  public referrals: HotReferral[] = [];

  public missions = {
    follow_youtube: false,
    invite_friend: false,
    follow_tg_hot: false,
    follow_tg_here: false,
    follow_tw_here: false,
    join_village: false,
    download_app: false,
    deposit_1NEAR: false,
    deposit_1USDT: false,
    deposit_NFT: false,
    send_69_hot: false,
  };

  public userData = {
    gas_free_transactions: 0,
    near_rpc: "rpc.mainnet.near.org",
    ft_contracts: [],
    claim_active: false,
    user_id: 0,
  };

  public village: { name: string; avatar: string; hot_balance: number; username: string } | null = null;
  public villages: HotVillage[] = [];

  public levels = [
    { id: 0, hot_price: 0, value: "0" },
    { id: 1, hot_price: 0, value: "0" },
    { id: 2, hot_price: 0, value: "0" },
    { id: 3, hot_price: 0, value: "0" },
    { id: 4, hot_price: 0, value: "0" },
    { id: 5, hot_price: 0, value: "0" },
    { id: 10, mission: "", value: "0" },
    { id: 11, mission: "", value: "0" },
    { id: 12, mission: "", value: "0" },
    { id: 13, mission: "", value: "0" },
    { id: 14, mission: "", value: "0" },
    { id: 15, mission: "", value: "0" },
    { id: 20, hot_price: 0, value: "0" },
    { id: 21, hot_price: 0, value: "0" },
    { id: 22, hot_price: 0, value: "0" },
    { id: 23, hot_price: 0, value: "0" },
    { id: 24, hot_price: 0, value: "0" },
    { id: 25, hot_price: 0, value: "0" },
  ];

  constructor(readonly account: UserAccount) {
    makeObservable(this, {
      currentTime: observable,
      state: observable,
      missions: observable,
      userData: observable,
      village: observable,
      villages: observable,
      levels: observable,

      referralsTotal: observable,
      referralsEarn: observable,
      referrals: observable,

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
    this.updateStatus().finally(() => {
      this.getUserData().then(() => {
        this.fetchMissions();
        this.fetchReferrals();
      });
    });
  }

  async refreshOnchain() {
    await wait(5000);
    await Promise.allSettled([this.fetchBalance(), this.updateStatus()]);
    this.refreshOnchain();
  }

  cacheData() {
    return toJS({
      levels: this.levels,
      userData: this.userData,
      missions: this.missions,
      referralsTotal: this.referralsTotal,
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
    const data = await this.getVillage(villageid);
    runInAction(() => (this.village = data));
    this.updateCache();
  }

  async getVillage(id: string) {
    const resp = await this.account.api.request(`/api/v1/user/hot/village?village_id=${id}`);
    return await resp.json();
  }

  async joinVillage(id: string) {
    const tx = await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "join_village",
      args: { village: `${id}.village.hot.tg` },
    });

    this.updateStatus();
    this.fetchBalance();
    this.action("village", {
      hash: tx.transaction_outcome.id,
      new_village_id: id,
    });
  }

  async getUserData() {
    const resp = await this.account.api.request(`/api/v1/user/hot?hot_mining_speed=${this.hotPerHourInt}&next_claim_in=${this.remainingMiningSeconds}`);
    const data = await resp.json();

    this.account.tokens.addContracts(this.userData.ft_contracts);
    runInAction(() => {
      this.userData = data;
      this.updateCache();
    });
  }

  async register() {
    await this.account.api.request("/api/v1/user/hot", {
      body: JSON.stringify({ telegram_data: window.Telegram.WebApp?.initData }),
      method: "POST",
    });

    let startTime = Date.now();
    const checkStatus = async () => {
      if (Date.now() - startTime > 30_000) throw Error("The server is overloaded, please try later");
      try {
        await wait(2000);
        await this.updateStatus();
      } catch {
        await checkStatus();
      }
    };

    await checkStatus();

    window.Telegram.WebApp.requestWriteAccess();
    this.fetchBalance();
    this.getUserData();
    this.fetchMissions();
  }

  action(type: "village", data: { hash: string; old_village_id?: string; new_village_id: string }): Promise<void>;
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

  async completeMission(mission: keyof this["missions"]) {
    switch (mission) {
      case "deposit_1NEAR": {
        await this.account.tokens.updateNative();
        if (this.account.tokens.near.amountFloat >= 0.3) break;
        throw Error("Your NEAR balance has not yet updated");
      }

      case "join_village": {
        await this.updateStatus();
        if (this.state?.village !== null) break;
        throw Error("You haven't joined the village");
      }

      case "invite_friend":
        await this.updateStatus();
        if ((this.state?.refferals || 0) > 0) break;
        throw Error("You haven't invited referral");

      default:
        break;
    }

    await this.account.api.request(`/api/v1/user/hot/mission`, {
      body: JSON.stringify({ mission_id: mission }),
      method: "POST",
    });

    await this.fetchMissions();
    await this.getUserData();
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
    runInAction(() => {
      this.referralsEarn = +formatAmount(data.total_hot_mining_speed, 6);
      this.referralsTotal = data.total_referrals;
      this.referrals = data.referrals;
    });

    this.updateCache();
  }

  async fetchBalance() {
    await this.account.tokens.updateBalance(GAME_ID);
  }

  async fetchLevels() {
    const near = this.account.near;
    const state = await near.viewMethod(GAME_ID, "get_assets", { account_id: near.accountId });
    console.log(state);
    runInAction(() => (this.levels = state));
    this.updateCache();
  }

  async updateStatus() {
    const state = await this.account.near.viewMethod(GAME_ID, "get_user", { account_id: this.account.near.accountId });
    if (state == null) {
      runInAction(() => (this.userData.claim_active = false));
      throw Error("User is not registered, please try again");
    }

    this.updateCache();
    this.updateMyVillage();
    runInAction(() => (this.state = state));
  }

  async claim(charge_gas_fee?: boolean) {
    const earned = parseAmount(this.earned, 6).toString();
    const tx = await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "claim",
      args: { charge_gas_fee },
    });

    this.fetchBalance();
    this.updateStatus().then(() => this.getUserData());
    this.action("claim", {
      hash: tx.transaction_outcome.id,
      amount: earned,
      charge_gas_fee,
    });
  }

  getBoosterName(id: number) {
    if (this.isWood(id)) return "boost";
    if (this.isStorage(id)) return "storage";
    return "firespace";
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
      // @ts-ignore
      return this.missions[booster.mission] || false;
    }

    return this.intBalance.gte(new BN(booster.hot_price || 0));
  }

  async upgradeBooster(id: number) {
    const booster = this.getBooster(id);
    if (!booster) throw Error("Booster is not defined");

    if (booster.mission) {
      await this.completeMission(booster.mission as any);

      let startTime = Date.now();
      const checkStatus = async () => {
        if (Date.now() - startTime > 30_000) throw Error("The server is overloaded, please try later");
        await wait(2000);
        await this.updateStatus();
        const onchainLevel = this.state?.[this.getBoosterName(id)];
        if (onchainLevel == null || onchainLevel < id) await checkStatus();
      };

      await checkStatus();
      return;
    }

    if (!this.canUpgrade(id)) throw Error("Not enough HOT");
    await this.account.near.functionCall({
      contractId: GAME_ID,
      methodName: "buy_asset",
      gas: new BN(TGAS * 50),
      args: { asset_id: id },
    });

    await this.updateStatus().then(() => this.getUserData());
  }

  get balance() {
    const tokens = this.account.tokens;
    return Math.max(0, +(tokens.token(tokens.nearChain, "HOT")?.amountFloat || 0));
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

  get remainingMiningSeconds() {
    if (!this.state) return 0;
    const spend_ms = this.currentTime - Math.floor(this.state.last_claim / 1000_000);
    return Math.floor(Math.max(0, (this.storageCapacityMs - spend_ms) / 1000));
  }

  get remainingMiningHours() {
    if (!this.state) return 0;
    return (this.remainingMiningSeconds / 3600).toFixed(2);
  }

  get hotPerHourInt() {
    if (!this.state) return "0";
    return new BN(this.fireplaceBooster!.value || 0).muln(Math.max(1, +formatAmount(this.woodBoster!.value, 1))).toString();
  }

  get hotPerHour() {
    if (!this.state) return 0;
    return +Math.max(0, formatAmount(this.hotPerHourInt.toString(), 6)).toFixed(6);
  }

  get earned() {
    return +Math.max(0, (this.storageCapacityMs / 3600_000) * this.hotPerHour * this.miningProgress).toFixed(6);
  }

  get referralLink() {
    return `t.me/herewalletbot/app?startapp=${this.userData.user_id}`;
  }
}

export default Hot;
