import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupExportSelectorModal } from "@near-wallet-selector/account-export";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupSender } from "@near-wallet-selector/sender";
import { KeyPairEd25519 } from "near-api-js/lib/utils";

import { accounts, useWallet } from "../../core/Accounts";

export const exportWallet = async () => {
  const user = useWallet();
  if (user == null) return;

  const pair = KeyPairEd25519.fromRandom();
  await user.near.callTransaction({
    receiverId: user.near.accountId,
    actions: [
      {
        type: "AddKey",
        params: {
          publicKey: pair.publicKey.toString(),
          accessKey: { permission: "FullAccess" },
        },
      },
    ],
  });

  const selector = await setupWalletSelector({
    network: "mainnet",
    modules: [setupMyNearWallet(), setupSender(), setupMeteorWallet(), setupHereWallet()],
  });

  const modal = setupExportSelectorModal(selector, {
    accounts: [{ accountId: user.near.accountId, privateKey: pair.getPublicKey().toString() }],
  });

  modal.show();
};
