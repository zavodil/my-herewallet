import { action, computed, makeObservable, observable, runInAction } from "mobx";
import UserAccount from "./UserAccount";
import { BN } from "bn.js";
import { TGAS } from "./constants";

const GAME_ID = "game.hot-token.testnet";
const HOT_ID = "ft.hot-token.testnet";

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
  public balance = -1;

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
      balance: observable,
      missions: observable,
      levels: observable,
      miningProgress: computed,
      remainingMiningHours: computed,
      hotPerHour: computed,
      earned: computed,
    });

    setInterval(
      action(() => (this.currentTime = Date.now())),
      1000
    );

    this.updateStatus().then(() => this.fetchReferrals());
    this.fetchMissions();
    this.fetchBalance();
    this.fetchLevels();
  }

  async register(inviter: string) {
    await this.account.api.request("/api/v1/user/hot", {
      body: JSON.stringify({ inviter_id: inviter }),
      method: "POST",
    });
    await this.fetchBalance();
  }

  async fetchMissions() {
    const resp = await this.account.api.request("/api/v1/user/hot/missions");
    const data = await resp.json();
    runInAction(() => {
      this.missions = data;
    });
  }

  async fetchReferrals() {
    if (!this.state?.has_refferals) return;
    const resp = await this.account.api.request("/api/v1/user/hot/referrals");
    const data = await resp.json();
    runInAction(() => (this.referrals = data.referrals));
  }

  async fetchBalance() {
    const balance = await this.account.near.viewMethod(HOT_ID, "ft_balance_of", {
      account_id: this.account.near.accountId,
    });

    runInAction(() => {
      this.balance = +balance;
    });
  }

  async fetchLevels() {
    const state = await this.account.near.viewMethod(GAME_ID, "get_assets", {
      account_id: this.account.near.accountId,
    });
    runInAction(() => (this.levels = state));
  }

  async updateStatus() {
    const state = await this.account.near.viewMethod(GAME_ID, "get_user", { account_id: this.account.near.accountId });
    runInAction(() => (this.state = state));
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
        contractId: HOT_ID,
        methodName: "ft_transfer_call",
        attachedDeposit: new BN("1"),
        gas: new BN(TGAS * 50),
        args: {
          receiver_id: GAME_ID,
          amount: booster.hot_price.toString(),
          msg: JSON.stringify({ asset_id: id }),
        },
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
}

export default Hot;
