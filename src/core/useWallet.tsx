import React, { useEffect, useState, useContext } from "react";
import "@near-wallet-selector/modal-ui/styles.css";

import { WalletSelector, Wallet } from "@near-wallet-selector/core";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal, WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupOptoWallet } from "@near-wallet-selector/opto-wallet";
import { setupFinerWallet } from "@near-wallet-selector/finer-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupXDEFI } from "@near-wallet-selector/xdefi";

import { WalletAccount } from "./WalletAccount";
import UserAccount from "./UserAccount";
import { WidgetStrategy } from "@here-wallet/core";

type AppServices = {
  selector?: WalletSelector;
  selectorModal?: WalletSelectorModal;
  user?: UserAccount;
};

const AppContext = React.createContext<AppServices>({});

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<AppServices>({});

  useEffect(() => {
    const init = async () => {
      const selector = await setupWalletSelector({
        network: "mainnet",
        modules: [
          setupHereWallet(),
          setupNearWallet(),
          setupMyNearWallet(),
          setupSender(),
          setupMathWallet(),
          setupNightly(),
          setupMeteorWallet(),
          setupNarwallets(),
          setupWelldoneWallet(),
          setupLedger(),
          setupNearFi(),
          setupCoin98Wallet(),
          setupOptoWallet(),
          setupFinerWallet(),
          setupNeth(),
          setupXDEFI(),
        ],
      });

      const selectorModal = setupModal(selector, { contractId: "storage.herewallet.near" });
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

    init();
  }, []);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}

export function useWallet() {
  const context = useContext(AppContext);
  return context;
}
