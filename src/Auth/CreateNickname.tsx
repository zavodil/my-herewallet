import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";
import { Receiver } from "../core/Receiver";
import { useWallet } from "../core/Accounts";
import { ConnectType } from "../core/types";

import { H1, SmallText, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import HereInput from "../uikit/Input";
import { colors } from "../uikit/theme";

import { IntroImage, Page, Root } from "./styled";
import Header from "../Home/Header";

const CreateNickname = () => {
  const user = useWallet();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [receiver] = useState(() => new Receiver(user!));
  const [isCreating, setCreating] = useState(false);

  useEffect(() => {
    receiver.setInput(nickname + ".near");
    receiver.load();
  }, [nickname]);

  return (
    <Root>
      <Header />

      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <div style={{ width: "100%", maxWidth: 380 }}>
          <div>
            <H1>Create nickname</H1>
            <Text style={{ marginTop: 8 }}>Nickname is attached to your wallet address and cannot be changed</Text>
          </div>

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

          <div style={{ display: "flex", gap: 12 }}>
            <ActionButton stroke style={{ flex: 1 }} onClick={() => navigate("/")} disabled={isCreating}>
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
                user
                  ?.bindNickname(receiver.input)
                  .then(() => setCreating(false))
                  .catch(() => setCreating(false));
              }}
            >
              {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
            </ActionButton>
          </div>
        </div>
      </Page>
    </Root>
  );
};

export default observer(CreateNickname);
