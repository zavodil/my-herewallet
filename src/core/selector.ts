import "@near-wallet-selector/modal-ui/styles.css";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearSnap } from "./near-snap";

const initSelector = async () => {
  const selector = await setupWalletSelector({
    network: "mainnet",
    modules: [
      setupNearSnap(),
      setupHereWallet(),
      setupMyNearWallet(),
      setupWalletConnect({
        projectId: "621c3cc4e9a5da50c1ed23c0f338bf06",
        chainId: "near:mainnet",
        metadata: {
          name: "HERE Stake",
          description: "Liquid Staking for Near Protocol",
          url: "https://my.herewallet.app/stake",
          icons: [],
        },
      }),
    ],
  });

  const selectorModal = setupModal(selector, { contractId: "storage.herewallet.near" });
  return { selector, selectorModal };
};

export { initSelector };
