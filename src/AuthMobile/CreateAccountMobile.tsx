import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Receiver } from "../core/Receiver";
import { accounts, useWallet } from "../core/Accounts";

import { generateMnemonic } from "../core/near-chain/passphrase/bip39";
import { H1, SmallText, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator, Button } from "../uikit";
import HereInput from "../uikit/Input";
import { colors } from "../uikit/theme";

import { Root } from "./styled";
import Icon from "../uikit/Icon";
import { sheets } from "../uikit/Popup";
import { ClaimingLoading } from "../Home/HOT/modals";

const CreateAccountMobile = () => {
  const user = useWallet();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [receiver] = useState(() => new Receiver(user!));
  const [isCreating, setCreating] = useState(false);

  const onCreate = async (nick?: string) => {
    sheets.present({ id: "Loading", fullscreen: true, element: <ClaimingLoading text="Creating..." /> });
    await accounts.connectWeb(generateMnemonic(), nick);
    sheets.dismiss("Loading");
  };

  useEffect(() => {
    receiver.setInput(nickname + ".near");
    receiver.load();
  }, [nickname]);

  return (
    <Root>
      <Button style={{ position: "absolute", left: 16, top: 16 }} onClick={() => navigate("/", { replace: true })}>
        <Icon name="arrow-left" />
      </Button>

      <div style={{ flex: 1, width: "100%", marginTop: 42 }}>
        <H1>Create nickname</H1>
        <Text style={{ marginTop: 8 }}>Fill in the info to create a wallet</Text>

        <div style={{ position: "relative", margin: "42px 0 56px" }}>
          <HereInput
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            postfixStyle={{ marginLeft: 0 }}
            postfix=".near"
            autoFocus
          />

          {receiver.input !== ".near" && !receiver.isLoading && (
            <SmallText style={{ position: "absolute", color: colors.red, top: 64 }}>
              {receiver.validateError ? receiver.validateError : receiver.isExist ? "Nickname is already taken" : ""}
            </SmallText>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            gap: 16,
            padding: "24px 16px",
          }}
        >
          <ActionButton stroke style={{ flex: 1 }} onClick={() => onCreate("")} disabled={isCreating}>
            Skip
          </ActionButton>
          <ActionButton
            style={{ flex: 1 }}
            disabled={
              isCreating || receiver.isLoading || receiver.isExist || receiver.isLoading || !!receiver.validateError
            }
            onClick={() => {
              if (isCreating) return;
              setCreating(true);
              onCreate(receiver.input).finally(() => setCreating(false));
            }}
          >
            {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
          </ActionButton>
        </div>
      </div>
    </Root>
  );
};

export default observer(CreateAccountMobile);
