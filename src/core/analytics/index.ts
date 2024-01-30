import { useCallback, useEffect } from "react";
import { AnalyticsConfig, AnalyticsEvents } from "./events";
import { HereApi } from "../network/api";
import { useWallet } from "../Accounts";
import UserAccount from "../UserAccount";
import { isTgMobile } from "../../env";

export interface AnalyticEvent {
  timestamp: number;
  event_type: string;
  account_id?: string;
  property: Record<string, any>;
}

export class AnalyticsTracker {
  static shared = new AnalyticsTracker();

  private api = new HereApi();
  private events: AnalyticEvent[] = [];
  private batchSize = 20;
  private _lastAccountId?: string;

  constructor() {
    window.addEventListener("beforeunload", () => {
      navigator.sendBeacon(
        "https://api.herewallet.app/api/v1/user/events",
        JSON.stringify({
          device_id: this.api.deviceId,
          platform: isTgMobile() ? "telegram" : "web",
          events: this.events.concat([
            {
              timestamp: Math.floor(Date.now() / 1000),
              account_id: this._lastAccountId,
              event_type: "app:close",
              property: {},
            },
          ]),
        })
      );
    });
  }

  async track(name: string, params: Record<string, number | string | boolean> = {}, account_id?: string) {
    console.log("Analytics", name, params);
    this._lastAccountId = account_id;
    this.events.push({
      timestamp: Math.floor(Date.now() / 1000),
      property: params,
      event_type: name,
      account_id,
    });

    this.trySend();
  }

  async flush() {
    const events = this.events;
    this.events = [];
    await this.api.sendEvents(events);
  }

  private trySend() {
    if (this.events.length < this.batchSize) return;
    const events = this.events.slice(0, this.batchSize);
    this.events = this.events.slice(this.batchSize);
    this.api
      .sendEvents(events)
      .then(() => console.log("Analytics batch sent"))
      .catch((error) => {
        this.events = this.events.concat(events);
        console.error("Analytics", error);
      });
  }
}
