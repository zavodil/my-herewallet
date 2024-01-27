import React, { useEffect, useState } from "react";
import { setupExportSelectorModal } from "@near-wallet-selector/account-export";
import { KeyPair, KeyPairEd25519 } from "near-api-js/lib/utils";

import "@near-wallet-selector/modal-ui/styles.css";
import "@near-wallet-selector/account-export/styles.css";

import { accounts, useWallet } from "../../core/Accounts";
import { ActionButton, ActivityIndicator, H2, Text } from "../../uikit";
import { notify } from "../../core/toast";
import { storage } from "../../core/Storage";
import * as S from "./styled";

export const ExportAccountWidget = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const user = useWallet();

  const [isLoading, setLoading] = useState(false);
  const [pair, setPair] = useState<KeyPair>();

  const makeExport = async (selectedPair?: KeyPair) => {
    try {
      if (!user || isLoading) return;
      setLoading(true);

      let activePair = selectedPair || pair;
      if (activePair == null) {
        activePair = KeyPairEd25519.fromRandom();
        await user.near.callTransaction({
          receiverId: user.near.accountId,
          actions: [
            {
              type: "AddKey",
              params: {
                publicKey: activePair.getPublicKey().toString(),
                accessKey: { permission: "FullAccess" },
              },
            },
          ],
        });

        setPair(activePair);
      }

      const modal = setupExportSelectorModal(await accounts.selector, {
        accounts: [{ accountId: user.near.accountId, privateKey: activePair!.toString() }],
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

  useEffect(() => {
    if (!user || !isOpen) return;
    const cred = storage.getAccount(user.id);
    if (cred?.privateKey) makeExport(KeyPair.fromString(cred.privateKey));
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <S.ModalWrap>
      <S.ModalOverlay onClick={onClose} />
      <S.ModalContent>
        <H2>Export wallet</H2>
        <Text style={{ textAlign: "center" }}>
          To transfer your account to another wallet, first create a new full access key, and then select the wallet where you want to export the new key. Follow the instructions, it's simple and
          safe!
        </Text>

        <ActionButton style={{ marginTop: 32, maxWidth: 300 }} onClick={() => makeExport()} disabled={isLoading}>
          {isLoading ? <ActivityIndicator style={{ transform: "scale(0.5)" }} width={5} /> : <>{pair ? "Export key" : "Create new key"}</>}
        </ActionButton>
      </S.ModalContent>
    </S.ModalWrap>
  );
};
