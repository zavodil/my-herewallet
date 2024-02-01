import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Receiver } from "../core/Receiver";
import { accounts, useWallet } from "../core/Accounts";
import { notify } from "../core/toast";

import { H1, H3, SmallText, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import { ClaimingLoading } from "../Home/HOT/modals";
import { useNavigateBack } from "../useNavigateBack";
import { colors } from "../uikit/theme";
import HereInput from "../uikit/Input";
import { Root, WordsWrap } from "./styled";
import { generateSeedPhrase } from "../core/near-chain/passphrase";
import { storage } from "../core/Storage";
import { ConnectType } from "../core/types";
import { Button } from "../uikit/button";
import { SensitiveCard } from "../Settings/styled";
import { wait } from "../core/helpers";
import Icon from "../uikit/Icon";

const CreateAccountMobile = () => {
  useNavigateBack();
  const user = useWallet();
  const navigate = useNavigate();

  const [receiver] = useState(() => new Receiver(user!));
  const [isCreating, setCreating] = useState(false);
  const [seed, setSeed] = useState<string>();

  useEffect(() => {
    if (!receiver.input) return;

    const exist = storage.getAccount(receiver.input);
    if (exist?.seed) return setSeed(exist.seed!);

    const { seedPhrase, publicKey, secretKey } = generateSeedPhrase();
    storage.addSafeData({ accountId: receiver.input, type: ConnectType.Web, privateKey: secretKey, seed: seedPhrase, publicKey });
    setSeed(seedPhrase);
  }, [receiver.input]);

  useEffect(() => {
    const user = window.Telegram.WebApp?.initDataUnsafe?.user;
    const nickname = (user?.username?.toLowerCase() || `i${user.id.toString().toLowerCase()}`) + ".tg";

    receiver.setInput(nickname);
    receiver.load().then(() => {
      if (!receiver.isExist) return;
      receiver.setInput(nickname.replace(".tg", "-hot.tg"));
      receiver.load().then(() => {
        if (!receiver.isExist) return;
        receiver.setInput(nickname.replace(".tg", "-hot1.tg"));
        receiver.load();
      });
    });
  }, []);

  const createAccount = async () => {
    if (isCreating) return;
    setCreating(true);

    try {
      setCreating(true);
      await accounts.connectWeb(seed!, receiver.input);
      setCreating(false);
      navigate("/");
    } catch (e: any) {
      await wait(1000);
      notify(e?.toString?.(), 5000);
      setCreating(false);
    }
  };

  if (isCreating) {
    return <ClaimingLoading time={30} text="Creating an account" />;
  }

  return (
    <Root>
      <div style={{ width: "100%", textAlign: "left" }}>
        <H1>Create account</H1>
      </div>

      <div style={{ marginTop: 42, position: "relative" }}>
        <H3>Address</H3>
        <Text style={{ marginBottom: 8 }}>We have created a unique NEAR address for you, which is similar to your telegram nickname.</Text>

        <div style={{ position: "relative" }}>
          <HereInput disabled label="Nickname" value={receiver.input} postfixStyle={{ marginLeft: 0 }} autoCapitalize="off" autoCorrect="off" autoComplete="off" autoFocus />
          {!receiver.isLoading && (
            <SmallText style={{ position: "absolute", color: colors.red, top: 60 }}>{receiver.validateError ? receiver.validateError : receiver.isExist ? "Nickname is already taken" : ""}</SmallText>
          )}
        </div>
      </div>

      <WordsWrap style={{ width: "100%", marginTop: 40 }}>
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <H3>Passphrase</H3>
            <Button
              $id="Settings.passphraseCopy"
              onClick={async () => {
                await navigator.clipboard.writeText(seed || "");
                notify("Passphrase has beed copied");
              }}
            >
              <Icon name="copy" />
            </Button>
          </div>
          <Text style={{ marginBottom: 8 }}>Copy your seed phrase right now to avoid losing your account!</Text>
          <SensitiveCard>{seed}</SensitiveCard>
        </div>
      </WordsWrap>

      <div style={{ marginTop: "auto", width: "100%" }}>
        <ActionButton $id="CreateAccount.createNickname" style={{ flex: 1, width: "100%" }} disabled={isCreating} onClick={() => createAccount()}>
          {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Create"}
        </ActionButton>
      </div>
    </Root>
  );
};

export default observer(CreateAccountMobile);
