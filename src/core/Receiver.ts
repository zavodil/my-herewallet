import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { generateFromString } from "generate-avatar";

import UserAccount from "./UserAccount";
import { Chain } from "./token/types";
import { ConnectType } from "./types";
import { HereApi } from "./network/api";
import { NEAR_DOMAINS } from "./near-chain/constants";

export const MinAccountIdLen = 2;
export const MaxAccountIdLen = 64;
export const ValidAccountRe = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export function isValidAccountId(accountId: string) {
  return accountId && accountId.length >= MinAccountIdLen && accountId.length <= MaxAccountIdLen && accountId.match(ValidAccountRe);
}

export class ReceiverFetcher {
  static shared = new ReceiverFetcher();

  private cached: Record<string, { avatar?: string; name?: string; isHere?: boolean; time: number }> = {};
  constructor() {
    this.cached = {}; // this.getCache();
  }

  //   setCache(cache: Record<string, { avatar?: string; name?: string; time: number }>) {
  //     this.user.localStorage.set("social.cache", JSON.stringify(cache));
  //   }

  //   getCache(): Record<string, { avatar?: string; name?: string; time: number }> {
  //     try {
  //       return JSON.parse(this.user.localStorage.get("near.social.cache")!);
  //     } catch {
  //       return {};
  //     }
  //   }

  private provider = new JsonRpcProvider({ url: "https://rpc.mainnet.near.org" });
  private api = new HereApi();

  async getAvatar(id: string, type: ConnectType) {
    if (id) {
      const user = await ReceiverFetcher.shared.getUser(id).catch(() => null);
      return user?.avatar || `data:image/svg+xml;utf8,${generateFromString(id)}`;
    }

    if (type === ConnectType.Here) return require("../assets/here.svg");
    if (type === ConnectType.Ledger) return require("../assets/ledger.png");
    if (type === ConnectType.Snap) return require("../assets/metamask.svg");
    return require("../assets/here.svg");
  }

  async getUser(address: string, useCache = true): Promise<{ avatar?: string; isHere?: boolean; name?: string }> {
    if (useCache && this.cached[address]) {
      // Refetch data silently
      if (Date.now() - this.cached[address].time > 3600 * 1000) void this.getUser(address, false);
      return this.cached[address];
    }

    await this.provider.query({ request_type: "view_account", finality: "optimistic", account_id: address });
    const user = await this.api.isExist(address).catch(() => null);

    this.cached[address] = { avatar: user?.avatar_url, isHere: user?.exist, time: Date.now() };
    // this.setCache(this.cached);
    return this.cached[address];
  }
}

export class Receiver {
  public input = "";
  public name: string | null = null;
  public avatar: string | null = null;

  public address: string | null = null;
  public validateError: string | null = null;

  public isExist = true;
  public isLoading = false;
  public needLoad = false;

  public isHere = false;

  constructor(readonly user: UserAccount) {
    makeObservable(this, {
      input: observable,
      name: observable,
      avatar: observable,

      address: observable,
      validateError: observable,

      isHere: observable,
      isExist: observable,
      isLoading: observable,

      setInput: action,
      label: computed,
      text: computed,
      type: computed,
      chain: computed,
      receiver: computed,
    });
  }

  contains(input: string) {
    return this.input?.toLowerCase().includes(input.toLowerCase()) || this.name?.toLowerCase().includes(input.toLowerCase());
  }

  async getAddress() {
    return this.address;
  }

  async load() {
    if (!this.needLoad) return;
    this.needLoad = false;

    if (this.address == null) return;
    runInAction(() => (this.isLoading = true));
    const address = this.address;

    // Load near address metadata
    try {
      const profile = await ReceiverFetcher.shared.getUser(address);
      if (this.input !== address) return;
      return runInAction(() => {
        this.isHere = profile.isHere ?? false;
        this.avatar = profile.avatar ?? null;
        this.name = profile.name ?? null;
        this.isLoading = false;
        this.isExist = true;
      });
    } catch (e) {
      console.log(e);
      if (this.input !== address) return;
      return runInAction(() => {
        this.isExist = NEAR_DOMAINS.some((t) => address.endsWith(t)) ? false : true;
        this.isLoading = false;
        this.isHere = false;
      });
    }
  }

  setInput(input: string) {
    this.input = input;
    this.address = null;
    this.name = null;
    this.avatar = null;
    this.isLoading = false;
    this.needLoad = true;
    this.isExist = false;

    if (isValidAccountId(this.input)) {
      if (this.input.length === 64 || NEAR_DOMAINS.some((t) => this.input.endsWith(t))) {
        this.address = this.input;
        this.validateError = null;
        this.isExist = true;
        return;
      }
    }

    this.validateError = "Invalid address";
    this.isExist = false;
    this.needLoad = false;
  }

  get label() {
    if (this.name) return this.name;
    if (this.address) return this.address;
    return this.input;
  }

  get text() {
    if (this.name) return this.address || "";
    if (this.address) return this.name || "";
    return "";
  }

  get type() {
    if (this.address) return "address";
    return "address";
  }

  get chain() {
    return this.input.endsWith(".testnet") ? Chain.NEAR_TESTNET : Chain.NEAR;
  }

  get receiver() {
    if (this.address) return this.address;
    return this.input;
  }

  static isValidAddress(input: string) {
    return isValidAccountId(input);
  }

  static chain(input: string) {
    return input.endsWith(".testnet") ? Chain.NEAR_TESTNET : Chain.NEAR;
  }
}
