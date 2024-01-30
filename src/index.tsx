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
