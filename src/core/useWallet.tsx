import React, { useEffect, useState, useContext, useRef } from "react";
import type { Wallet, WalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { WalletAccount } from "./WalletAccount";
import UserAccount, { Storage } from "./UserAccount";

type AppServices = {
  selector?: WalletSelector;
  selectorModal?: WalletSelectorModal;
  user?: UserAccount;
};

const AppContext = React.createContext<AppServices>({});

// @ts-ignore
class InjectedWallet implements BrowserWallet {
  async signAndSendTransaction(data: any) {
    parent.postMessage({ action: "signAndSendTransaction", data }, "*");
  }
}

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<AppServices>({});
  const lastId = useRef();

  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (e.data.accountId && lastId.current !== e.data.accountId) {
        lastId.current = e.data.accountId;
        Storage.memoryData = { ...(e.data.localStorage || {}) };

        // @ts-ignore
        const account = new WalletAccount(e.data.accountId, new InjectedWallet());
        const user = new UserAccount(account);
        setContext({ user });
      }
    });

    const init = async () => {
      const { initSelector }: any = await import("./selector");
      const { selector, selectorModal } = await initSelector();

      selector.store.observable.subscribe(async () => {
        const wallet: Wallet | null = await selector.wallet().catch(() => null);
        if (wallet == null) return setContext({ selector, selectorModal });
        const accounts = await wallet.getAccounts();
        const account = new WalletAccount(accounts[0].accountId, wallet);
        const user = new UserAccount(account);
        setContext({ user, selectorModal, selector });
      });

      setContext({ selector, selectorModal });
    };

    if (window.location.search === "?stake") return;
    init();
  }, []);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}

export function useWallet() {
  const context = useContext(AppContext);
  return context;
}
