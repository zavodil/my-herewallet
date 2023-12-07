import { useEffect } from "react";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupExportSelectorModal } from "@near-wallet-selector/account-export";
import "@near-wallet-selector/account-export/styles.css";
import "@near-wallet-selector/modal-ui/styles.css";

const ExportAccount = () => {
  useEffect(() => {
    const init = async () => {
      const selector = await setupWalletSelector({
        network: "mainnet",
        storage: {
          async removeItem() {},
          async setItem() {},
          async getItem() {
            return null;
          },
        },
        modules: [setupNearWallet({})],
      });

      const modal = setupExportSelectorModal(selector, {
        accounts: [
          {
            accountId: "test.testnet",
            privateKey: "ed25519:....",
          },
        ],
      });

      modal.show();
    };

    init();
  }, []);

  return null;
};

export default ExportAccount;
