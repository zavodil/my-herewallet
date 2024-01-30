import React, { useEffect, useState } from "react";
import { KeyPair, KeyPairEd25519 } from "near-api-js/lib/utils";

import "@near-wallet-selector/modal-ui/styles.css";
import "@near-wallet-selector/account-export/styles.css";

import Footer from "../../OpenInApp/Footer";
import { SensitiveCard } from "../../Settings/styled";

import { generateSeedPhrase } from "../../core/near-chain/passphrase";
import { ActionButton, ActivityIndicator, Button, H2, H3, Text } from "../../uikit";
import { useWallet } from "../../core/Accounts";
import { storage } from "../../core/Storage";
import { notify } from "../../core/toast";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";
import * as S from "./styled";

export const ExportAccountWidget = ({ onClose }: { onClose: () => void }) => {
  const user = useWallet();

  const [isLoading, setLoading] = useState(false);
  const [pair, setPair] = useState<KeyPair>();
  const [seed, setSeed] = useState<string>();

  const extractKey = async () => {
    try {
      if (!user || isLoading) return;
      let cred = storage.getAccount(user.id);
      if (cred?.privateKey) {
        setPair(KeyPair.fromString(cred.privateKey));
        setSeed(cred.seed);
        return;
      }

      setLoading(true);
      const { secretKey, seedPhrase, publicKey } = generateSeedPhrase();
      const activePair = KeyPairEd25519.fromRandom();
      await user.near.callTransaction({
        receiverId: user.near.accountId,
        actions: [
          {
            type: "AddKey",
            params: {
              publicKey: publicKey,
              accessKey: { permission: "FullAccess" },
            },
          },
        ],
      });

      cred = storage.getAccount(user.id)!;
      cred.privateKey = secretKey;
      cred.seed = seedPhrase;
      storage.updateAccount(cred);

      setSeed(seedPhrase);
      setPair(activePair);
      setLoading(false);
    } catch (e) {
      console.log(e);
      notify(`Something wrong: ${e?.toString?.()}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const cred = storage.getAccount(user.id);
    if (cred?.privateKey) setPair(KeyPair.fromString(cred.privateKey));
    setSeed(cred?.seed);
  }, [user]);

  if (pair || seed) {
    return (
      <S.ModalWrap>
        <S.ModalOverlay onClick={onClose} />
        <S.ModalContent style={{ padding: 0, maxWidth: 800 }}>
          <div style={{ padding: "52px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "0 64px" }}>
              <H2>Import to HERE Wallet</H2>
              <Text style={{ marginTop: 8, color: colors.blackSecondary }}>
                Download HERE Wallet from App Store or Google play and import your seedphrase. <b>Do not share your passphrase or private key with anyone, even with us!</b>
              </Text>
            </div>

            <div style={{ margin: "42px" }}>
              {seed ? (
                <div style={{ width: 400, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <H3>Seedphrase</H3>
                    <Button
                      $id="ExportWidget.seedphraseCopy"
                      onClick={async () => {
                        await navigator.clipboard.writeText(seed!);
                        notify("Seedphrase has beed copied");
                      }}
                    >
                      <Icon name="copy" />
                    </Button>
                  </div>
                  <SensitiveCard style={{ width: "100%", maxWidth: 400 }}>{seed}</SensitiveCard>
                </div>
              ) : (
                <div style={{ width: 400, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <H3>Private key</H3>
                    <Button
                      $id="ExportWidget.privateKeyCopy"
                      onClick={async () => {
                        await navigator.clipboard.writeText(pair?.toString()!);
                        notify("Private key has beed copied");
                      }}
                    >
                      <Icon name="copy" />
                    </Button>
                  </div>
                  <SensitiveCard style={{ width: "100%", maxWidth: 400 }}>{pair?.toString()}</SensitiveCard>
                </div>
              )}
            </div>
          </div>

          <Footer />
        </S.ModalContent>
      </S.ModalWrap>
    );
  }

  return (
    <S.ModalWrap>
      <S.ModalOverlay onClick={onClose} />
      <S.ModalContent>
        <H2>Export wallet</H2>
        <Text style={{ textAlign: "center" }}>
          To transfer your account to another wallet, first create a new full access key, and then select the wallet where you want to export the new key. Follow the instructions, it's simple and
          safe!
        </Text>

        <ActionButton $id="ExportWidget.createKey" style={{ marginTop: 32, maxWidth: 300 }} onClick={() => extractKey()} disabled={isLoading}>
          {isLoading ? <ActivityIndicator style={{ transform: "scale(0.5)" }} width={5} /> : <>{pair ? "Export key" : "Create new key"}</>}
        </ActionButton>
      </S.ModalContent>
    </S.ModalWrap>
  );
};
