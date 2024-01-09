import React, { useState } from "react";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupExportSelectorModal } from "@near-wallet-selector/account-export";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupSender } from "@near-wallet-selector/sender";
import { KeyPairEd25519 } from "near-api-js/lib/utils";

import "@near-wallet-selector/modal-ui/styles.css";
import "@near-wallet-selector/account-export/styles.css";

import { useWallet } from "../../core/Accounts";
import { ActionButton, ActivityIndicator, H2, Text } from "../../uikit";
import { notify } from "../../core/toast";
import * as S from "./styled";

export const ExportAccountWidget = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const user = useWallet();
  if (user == null) return null;

  const [isLoading, setLoading] = useState(false);
  const [pair, setPair] = useState<KeyPairEd25519>();

  const makeExport = async () => {
    try {
      if (isLoading) return;
      setLoading(true);

      let activePair = pair;
      if (pair == null) {
        activePair = KeyPairEd25519.fromRandom();
        await user.near.callTransaction({
          receiverId: user.near.accountId,
          actions: [
            {
              type: "AddKey",
              params: {
                publicKey: activePair.publicKey.toString(),
                accessKey: { permission: "FullAccess" },
              },
            },
          ],
        });

        setPair(activePair);
      }

      const selector = await setupWalletSelector({
        network: "mainnet",
        modules: [setupMyNearWallet(), setupSender(), setupMeteorWallet(), setupHereWallet()],
      });

      const modal = setupExportSelectorModal(selector, {
        accounts: [{ accountId: user.near.accountId, privateKey: activePair!.secretKey }],
        onComplete: () => onClose(),
      });

      modal.show();
      onClose();
      setLoading(false);
    } catch (e) {
      console.log(e);
      notify(`Something wrong: ${e?.toString?.()}`);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalWrap>
      <S.ModalOverlay onClick={onClose} />
      <S.ModalContent>
        <H2>Export wallet</H2>
        <Text style={{ textAlign: "center" }}>
          To transfer your account to another wallet, first create a new full access key, and then select the wallet
          where you want to export the new key. Follow the instructions, it's simple and safe!
        </Text>

        <ActionButton style={{ marginTop: 32, maxWidth: 300 }} onClick={makeExport} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator style={{ transform: "scale(0.5)" }} width={5} />
          ) : (
            <>{pair ? "Export key" : "Create new key"}</>
          )}
        </ActionButton>
      </S.ModalContent>
    </S.ModalWrap>
  );
};
