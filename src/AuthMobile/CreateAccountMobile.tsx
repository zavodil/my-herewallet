import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Receiver } from "../core/Receiver";
import { accounts, useWallet } from "../core/Accounts";
import { generateMnemonic } from "../core/near-chain/passphrase/bip39";
import { notify } from "../core/toast";

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
  const [nickname, setNickname] = useState(window.Telegram.WebApp?.initDataUnsafe?.user?.username?.toLowerCase().replaceAll("-", "_") || "");
  const [receiver] = useState(() => new Receiver(user!));
  const [isCreating, setCreating] = useState(false);

  const onCreate = async (nick?: string) => {
    if (isCreating) return;
    try {
      setCreating(true);
      await accounts.connectWeb(generateMnemonic(), nick);
      setCreating(false);
      navigate("/");
    } catch (e: any) {
      notify(e?.toString?.());
      setCreating(false);
    }
  };

  useEffect(() => {
    receiver.setInput(nickname + ".hot-user.near");
    receiver.load();
  }, [nickname]);

  if (isCreating) {
    return <ClaimingLoading time={30} text="Creating an account" />;
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
            postfix=".hot-user.near"
            autoFocus
          />

          {receiver.input !== ".near" && !receiver.isLoading && (
            <SmallText style={{ position: "absolute", color: colors.red, top: 64 }}>{receiver.validateError ? receiver.validateError : receiver.isExist ? "Nickname is already taken" : ""}</SmallText>
          )}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 56, width: "100%", gap: 16 }}>
        <ActionButton
          $id="CreateAccount.createNickname"
          style={{ flex: 1 }}
          disabled={isCreating || receiver.isLoading || receiver.isExist || receiver.isLoading || !!receiver.validateError}
          onClick={() => onCreate(receiver.input)}
        >
          {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
        </ActionButton>
      </div>
    </Root>
  );
};

export default observer(CreateAccountMobile);
