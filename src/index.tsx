import React from "react";
import ReactDOM from "react-dom/client";

import "./assets/cabinet-grotesk/index.css";
import "./assets/manrope/index.css";

import { isTgMobile, isTgBeta } from "./env";
import { colors } from "./uikit/theme";
import App from "./App";
import { AnalyticsTracker } from "./core/analytics";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

declare global {
  interface Window {
    Telegram: { WebApp: any };
  }
}

let pushUrl = "";
window.history.pushState = new Proxy(window.history.pushState, {
  apply: (target, thisArg, argArray: any) => {
    if (pushUrl !== argArray[2]) {
      AnalyticsTracker.shared.track("history:push", { route: argArray[2] });
      pushUrl = argArray[2];
    }

    return target.apply(thisArg, argArray);
  },
});

let replaceUrl = "";
window.history.replaceState = new Proxy(window.history.replaceState, {
  apply: (target, thisArg, argArray: any) => {
    if (replaceUrl !== argArray[2]) {
      AnalyticsTracker.shared.track("history:replace", { route: argArray[2] });
      replaceUrl = argArray[2];
    }

    return target.apply(thisArg, argArray);
  },
});

let backUrl = "";
window.addEventListener("popstate", () => {
  if (backUrl === document.location.pathname) return;
  AnalyticsTracker.shared.track("history:back", { route: document.location.pathname });
  backUrl = document.location.pathname;
});

if (isTgMobile()) {
  window.Telegram.WebApp.setBackgroundColor?.(colors.elevation1);
  window.Telegram.WebApp.setHeaderColor?.(colors.elevation0);
  window.Telegram.WebApp.expend?.();
} else {
  window.Telegram = {
    WebApp: {
      openLink: (url: string) => window.open(url, "_blank"),
      openTelegramLink: (url: string) => window.open(url, "_blank"),
    },
  };
}

if (isTgBeta()) {
  // @ts-ignore
  window.eruda.init();
}

if (process.env.NODE_ENV === "production") {
  console.warn = () => {};
  console.log = () => {};
}

if (process.env.NODE_ENV === "development") {
  window.Telegram.WebApp = {
    openLink: (url: string) => window.open(url, "_blank"),
    openTelegramLink: (url: string) => window.open(url, "_blank"),
    showConfirm: (_: any, cb: any) => cb(true),
    requestWriteAccess: () => {},
    initDataUnsafe: {},
    initData:
      "user=%7B%22id%22%3A23044610592%2C%22first_name%22%3A%22Andrey%22%2C%22last_name%22%3A%22Zhevlakov%22%2C%22username%22%3A%22azbang%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=8237934847306169715&chat_type=private&start_param=94637&auth_date=1706573477&hash=deb517d5366a9099d3f3b6022b734bc4cc188d4bf82eeec388b06d999b437f04",
  };
}
