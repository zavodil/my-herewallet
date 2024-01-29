import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Receiver } from "../core/Receiver";
import { accounts, useWallet } from "../core/Accounts";
import { generateMnemonic } from "../core/near-chain/passphrase/bip39";

import { H1, SmallText, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import { ClaimingLoading } from "../Home/HOT/modals";
import { useNavigateBack } from "../useNavigateBack";
import { colors } from "../uikit/theme";
import HereInput from "../uikit/Input";
import { Root } from "./styled";

const CreateAccountMobile = () => {
  useNavigateBack();
  const user = useWallet();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(window.Telegram.WebApp?.initDataUnsafe?.user?.username || "");
  const [receiver] = useState(() => new Receiver(user!));
  const [isCreating, setCreating] = useState(false);

  const onCreate = async (nick?: string) => {
    try {
      setCreating(true);
      await accounts.connectWeb(generateMnemonic(), nick);
      setCreating(false);
      navigate("/");
    } catch {
      setCreating(false);
    }
  };

  useEffect(() => {
    receiver.setInput(nickname + ".near");
    receiver.load();
  }, [nickname]);

  if (isCreating) {
    return <ClaimingLoading time={20} text="Creating an account" />;
  }

  return (
    <Root>
      <div style={{ flex: 1, width: "100%" }}>
        <H1>Create nickname</H1>
        <Text style={{ marginTop: 8 }}>Fill in the info to create a wallet</Text>

        <div style={{ marginTop: 42, position: "relative" }}>
          <HereInput
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            postfixStyle={{ marginLeft: 0 }}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            postfix=".hot.near"
            autoFocus
          />

          {receiver.input !== ".near" && !receiver.isLoading && (
            <SmallText style={{ position: "absolute", color: colors.red, top: 64 }}>{receiver.validateError ? receiver.validateError : receiver.isExist ? "Nickname is already taken" : ""}</SmallText>
          )}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 56, width: "100%", gap: 16 }}>
        <ActionButton stroke style={{ flex: 1 }} onClick={() => onCreate("")} disabled={isCreating}>
          Skip
        </ActionButton>
        <ActionButton
          style={{ flex: 1 }}
          disabled={isCreating || receiver.isLoading || receiver.isExist || receiver.isLoading || !!receiver.validateError}
          onClick={() => {
            if (isCreating) return;
            onCreate(receiver.input);
          }}
        >
          {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
        </ActionButton>
      </div>
    </Root>
  );
};

export default observer(CreateAccountMobile);
