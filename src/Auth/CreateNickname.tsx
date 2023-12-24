import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import hereWebLogo from "../assets/here-web.svg?url";
import introImage from "../assets/intro.png";

import { Receiver } from "../core/Receiver";
import { ConnectType } from "../core/UserAccount";
import { useWallet } from "../core/Accounts";
import { BoldP, H1, LargeP, SmallText } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import HereInput from "../uikit/Input";

import { Card, Header, IntroImage, Page, Root } from "./styled";
import { colors } from "../uikit/theme";

const CreateNickname = () => {
  const user = useWallet();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [receiver] = useState(() => new Receiver(user!));
  const [isCreating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.credential.type !== ConnectType.Snap) return navigate("/");
    setLoading(true);
    user
      .isNeedActivate()
      .then((is) => !is && navigate("/"))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    receiver.setInput(nickname + ".near");
    receiver.load();
  }, [nickname]);

  if (isLoading) return null;

  return (
    <Root>
      <Header>
        <Link to="/">
          <img style={{ height: 22, objectFit: "contain" }} src={hereWebLogo} />
        </Link>

        <BoldP as="a" href="https://download.herewallet.app">
          Don’t have an account? <span style={{ textDecoration: "underline" }}>Click here</span>
        </BoldP>
      </Header>

      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <Card style={{ width: "100%", maxWidth: 380 }}>
          <div>
            <H1>Create nickname</H1>
            <LargeP style={{ marginTop: 8 }}>Nickname is attached to your wallet address and cannot be changed</LargeP>
          </div>

          <div style={{ position: "relative" }}>
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
        </Card>
      </Page>
    </Root>
  );
};

export default observer(CreateNickname);
