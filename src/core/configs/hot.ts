import Hot from "../Hot";
import UserAccount from "../UserAccount";

export interface GasFreeMission {
  gasFree: number;
  icon: string;
  title: string;
  mission: keyof (typeof Hot.prototype)["missions"];
  onClick: (user: UserAccount) => void;
}

export interface HotReferral {
  hot_balance: number;
  hot_mining_speed: number;
  near_account_id: string;
  tg_avatar: string;
  tg_username: string;
}

export interface HotState {
  village?: string;
  last_claim: number;
  boost_ts_left: number;
  refferals: number;
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

export const boosters = [
  {
    id: 0,
    title: "Fireplace",
    text: "Better Fireplace boosts mining speed",
    description: "Increase passive mining speed",
    icon: require("../../assets/hot/fire/1.png"),
  },
  {
    id: 1,
    title: "Stone Fireplace",
    text: "Better Fireplace boosts mining speed",
    description: "Increase passive mining speed",
    icon: require("../../assets/hot/fire/2.png"),
  },
  {
    id: 2,
    title: "Gas Fireplace",
    text: "Better Fireplace boosts mining speed",
    description: "Increase passive mining speed",
    icon: require("../../assets/hot/fire/3.png"),
  },
  {
    id: 3,
    title: "Neon Fireplace",
    text: "Better Fireplace boosts mining speed",
    description: "Increase passive mining speed",
    icon: require("../../assets/hot/fire/4.png"),
  },
  {
    id: 4,
    title: "Neon Multy-fireplace",
    text: "Better Fireplace boosts mining speed",
    description: "Increase passive mining speed",
    icon: require("../../assets/hot/fire/5.png"),
  },
  {
    id: 5,
    title: "Neon Multy-fireplace",
    text: "Better Fireplace boosts mining speed",
    description: "Increase passive mining speed",
    icon: require("../../assets/hot/fire/5.png"),
  },

  {
    id: 10,
    title: "Basic Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
    icon: require("../../assets/hot/wood/1.png"),
    mission_text: "",
  },
  {
    id: 11,
    title: "Neon Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
    icon: require("../../assets/hot/wood/2.png"),
    mission_text: "Invite a referral",
  },
  {
    id: 12,
    title: "Titanium Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
    icon: require("../../assets/hot/wood/3.png"),
    mission_text: "Download the mobile app and import your account",
  },
  {
    id: 13,
    title: "Jedi Wood",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
    icon: require("../../assets/hot/wood/4.png"),
    mission_text: "Send 0.5+ NEAR from .near account, created at HERE Wallet",
  },
  {
    id: 14,
    title: "Uranium Boxes",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
    icon: require("../../assets/hot/wood/5.png"),
    mission_text: "Deposit 1+ USDT on your account",
  },
  {
    id: 15,
    title: "Uranium Boxes",
    text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood × Fireplace",
    description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
    icon: require("../../assets/hot/wood/5.png"),
    mission_text: "Coming soon...",
  },

  {
    id: 20,
    title: "Wooden Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    description: "Increase the fill\ntime to claim less often",
    icon: require("../../assets/hot/storage/1.png"),
  },
  {
    id: 21,
    title: "Metal Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    description: "Increase the fill\ntime to claim less often",
    icon: require("../../assets/hot/storage/2.png"),
  },
  {
    id: 22,
    title: "Modular Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    description: "Increase the fill\ntime to claim less often",
    icon: require("../../assets/hot/storage/3.png"),
  },
  {
    id: 23,
    title: "Liquid Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    description: "Increase the fill\ntime to claim less often",
    icon: require("../../assets/hot/storage/4.png"),
  },
  {
    id: 24,
    title: "Titanium Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    description: "Increase the fill\ntime to claim less often",
    icon: require("../../assets/hot/storage/5.png"),
  },
  {
    id: 25,
    title: "Titanium Storage",
    text: "Better storage holds more HOT and you can claim it less often",
    description: "Increase the fill\ntime to claim less often",
    icon: require("../../assets/hot/storage/5.png"),
  },
];

export const gasFreeMissions: GasFreeMission[] = [
  {
    gasFree: 1,
    icon: require("../../assets/hot/hot.png"),
    title: "Follow HOT on Telegram",
    mission: "follow_tg_hot",
    onClick: (user: UserAccount) => {
      window.Telegram.WebApp.openTelegramLink("https://t.me/hotonnear");
      setTimeout(() => user.hot.completeMission("follow_tg_hot"), 5000);
    },
  },
  {
    gasFree: 1,
    icon: require("../../assets/here.svg"),
    title: "Follow HERE on Telegram",
    mission: "follow_tg_here",
    onClick: (user: UserAccount) => {
      window.Telegram.WebApp.openTelegramLink("https://t.me/herewallet");
      setTimeout(() => user.hot.completeMission("follow_tg_here"), 5000);
    },
  },
  {
    gasFree: 1,
    icon: require("../../assets/youtube.svg"),
    title: "Follow HERE on Youtube",
    mission: "follow_youtube",
    onClick: (user: UserAccount) => {
      window.Telegram.WebApp.openLink("https://www.youtube.com/@herewallet");
      user.hot.completeMission("follow_youtube");
    },
  },
  {
    gasFree: 1,
    icon: require("../../assets/twitter-blue.svg"),
    title: "Follow HERE on Twitter",
    mission: "follow_tw_here",
    onClick: (user: UserAccount) => {
      window.Telegram.WebApp.openLink("https://twitter.com/here_wallet");
      user.hot.completeMission("follow_tw_here");
    },
  },
];
