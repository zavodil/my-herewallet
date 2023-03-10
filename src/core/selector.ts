import "@near-wallet-selector/modal-ui/styles.css";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupOptoWallet } from "@near-wallet-selector/opto-wallet";
import { setupFinerWallet } from "@near-wallet-selector/finer-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupModal } from "@near-wallet-selector/modal-ui";

const initSelector = async () => {
  const selector = await setupWalletSelector({
    network: "mainnet",
    modules: [
      setupHereWallet(),
      setupNearWallet(),
      setupMyNearWallet(),
      setupWalletConnect({
        projectId: "621c3cc4e9a5da50c1ed23c0f338bf06",
        metadata: {
          name: "HERE Stake",
          description: "Liquid Staking for Near Protocol",
          url: "https://my.herewallet.app/stake",
          icons: [],
        },
      }),
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
    ],
  });

  const selectorModal = setupModal(selector, { contractId: "storage.herewallet.near" });

  return { selector, selectorModal };
};

export { initSelector };
