import { action, makeObservable, observable, runInAction } from "mobx";
import { HereWallet, SignedMessageNEP0413, WidgetStrategy } from "@here-wallet/core";
import { base_encode } from "near-api-js/lib/utils/serialize";
import { PublicKey } from "near-api-js/lib/utils";
import { NearSnap } from "@near-snap/sdk";

import UserAccount, { ConnectType } from "./UserAccount";
import { getStorageJson } from "./helpers";
import { HereApi } from "./network/api";
import { notify } from "./toast";

export interface AccountCreds {
  type: ConnectType;
  accountId: string;
  publicKey: string;
  jwt: string;
}

class Accounts {
  static shared = new Accounts();
  public account: UserAccount | null = null;
  public accounts: AccountCreds[] = [];

  readonly api = new HereApi();
  readonly snap = new NearSnap();

  readonly wallet = new HereWallet({
    defaultStrategy: () =>
      new WidgetStrategy({
        widget: location.origin + "/connector",
        lazy: false,
      }),
  });

  constructor() {
    makeObservable(this, {
      account: observable,
      accounts: observable,
      select: action,
      disconnect: action,
      register: action,
    });

    this.accounts = getStorageJson("accounts", []);
    const selected = localStorage.getItem("selected");
    const account = this.accounts.find((t) => t.accountId === selected);
    if (account) this.account = new UserAccount(account);
  }

  select = (selected: string) => {
    const account = this.accounts.find((t) => t.accountId === selected);
    if (!account) return;

    this.account = new UserAccount(account);
    localStorage.setItem("selected", selected);
  };

  disconnect = (id: string) => {
    this.accounts = this.accounts.filter((t) => t.accountId !== id);
    this.account = this.accounts[0] ? new UserAccount(this.accounts[0]) : null;
    localStorage.setItem("selected", JSON.stringify(this.account?.credential.accountId || ""));
    localStorage.setItem("accounts", JSON.stringify(this.accounts));
    notify("Wallet has been disconnected");
  };

  register = async (type: ConnectType = ConnectType.Here) => {
    const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
    let sign: SignedMessageNEP0413;

    if (type === ConnectType.Snap) {
      await this.snap.install();
      const account = await this.snap.connect({ network: "mainnet" });
      if (account?.publicKey == null || account?.accountId == null) {
        notify("Register failed");
        return;
      }

      const names = await this.api.findAccount(PublicKey.from(account.publicKey));
      if (names[0] != null && names[0] !== account.accountId) {
        try {
          await accounts.snap.provider.invokeSnap(accounts.snap.id, "near_bindNickname", {
            network: "mainnet",
            nickname: names[0],
          });
        } catch {
          notify("You need bind nickname before login, but something failed, restart page and try again please", 5000);
          return;
        }
      }

      const signMaybe = await this.snap.signMessage({
        network: "mainnet",
        nonce: Array.from(new Uint8Array(Buffer.from(nonce))),
        recipient: "HERE Wallet",
        message: "web_wallet",
      });

      if (!signMaybe) return;
      sign = signMaybe as any;
    } else {
      sign = await this.wallet.signMessage({
        nonce: Buffer.from(nonce),
        recipient: "HERE Wallet",
        message: "web_wallet",
        onSuccess: (result: any) => {
          try {
            type = JSON.parse(result.payload).type || ConnectType.Here;
          } catch {
            type = ConnectType.Here;
          }
        },
      });
    }

    if (sign == null) {
      notify("Register failed");
      return;
    }

    notify("Authorization...");
    const token = await this.api.auth({
      msg: "web_wallet",
      device_id: this.api.deviceId,
      account_sign: base_encode(Buffer.from(sign.signature, "base64")),
      device_name: navigator.userAgent,
      near_account_id: sign.accountId,
      public_key: sign.publicKey.toString(),
      wallet_type: type as any,
      nonce: nonce,
      web_auth: true,
    });

    runInAction(() => {
      const data = { type, accountId: sign.accountId, publicKey: sign.publicKey, jwt: token };
      if (this.accounts.find((t) => t.accountId === data.accountId)) return;

      this.accounts.push(data);
      this.account = new UserAccount(data);
      localStorage.setItem("accounts", JSON.stringify(this.accounts));
      localStorage.setItem("selected", data.accountId);
      location.assign("/nickname");
    });
  };
}

export const accounts = Accounts.shared;
export const useWallet = () => accounts.account;

export default Accounts;
