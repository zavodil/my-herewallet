import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";
import { Receiver } from "../core/Receiver";
import { accounts, useWallet } from "../core/Accounts";

import { generateMnemonic } from "../core/near-chain/passphrase/bip39";
import { H1, LargeP, Text, SmallText } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import HereInput from "../uikit/Input";
import { colors } from "../uikit/theme";
import Header from "../Home/Header";

import { Card, IntroImage, Page, Root, WordItem, WordsWrap } from "./styled";
import { HereButton } from "../uikit/button";
import Icon from "../uikit/Icon";

const CreateAccount = () => {
  const user = useWallet();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [receiver] = useState(() => new Receiver(user!));
  const [selectedSeed, selectSeed] = useState<string | null>(null);
  const [seed, setSeed] = useState<string | null>(() => generateMnemonic());
  const [isCreating, setCreating] = useState(false);
  const isValidNick =
    isCreating || receiver.isLoading || receiver.isExist || receiver.isLoading || !!receiver.validateError;

  useEffect(() => {
    receiver.setInput(nickname + ".near");
    receiver.load();
  }, [receiver, nickname]);

  if (selectedSeed) {
    return (
      <Root>
        <Header />

        <Page>
          <IntroImage>
            <img src={introImage} />
            <img src={introImage} />
          </IntroImage>

          <Card style={{ width: "100%", maxWidth: 480 }}>
            <div>
              <H1>New account</H1>
              <LargeP style={{ marginTop: 8 }}>Create a nickname. It will be used as your wallet address</LargeP>
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
                  {receiver.validateError
                    ? receiver.validateError
                    : receiver.isExist
                    ? "Nickname is already taken"
                    : ""}
                </SmallText>
              )}
            </div>

            <div style={{ display: "flex", marginTop: 32, gap: 12 }}>
              <ActionButton
                stroke
                style={{ flex: 1 }}
                disabled={isCreating}
                onClick={() => {
                  if (isCreating) return;
                  setCreating(true);
                  accounts
                    .connectWeb(selectedSeed)
                    .then(() => navigate("/"))
                    .finally(() => setCreating(false));
                }}
              >
                Skip
              </ActionButton>
              <ActionButton
                style={{ flex: 1 }}
                disabled={isValidNick}
                onClick={() => {
                  if (isCreating) return;
                  setCreating(true);
                  accounts
                    .connectWeb(selectedSeed, receiver.input)
                    .then(() => navigate("/"))
                    .finally(() => setCreating(false));
                }}
              >
                {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
              </ActionButton>
            </div>
          </Card>
        </Page>
      </Root>
    );
  }

  return (
    <Root>
      <Header />

      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <Card style={{ width: "100%", maxWidth: 480 }}>
          <div>
            <H1>
              Setup Your
              <br />
              Secure Passphrase
            </H1>
            <Text style={{ marginTop: 8 }}>
              Write down the following words in order and keep them somewhere safe. Anyone with access to it will also
              have access to your account! You can access this words later in the settings
            </Text>
          </div>

          <WordsWrap>
            {seed?.split(" ").map((item, i) => (
              <WordItem key={i}>{item}</WordItem>
            ))}

            <div style={{ marginTop: 12, width: "100%", display: "flex", gap: 24, justifyContent: "space-between" }}>
              <HereButton style={{ flex: 1 }}>
                <Icon name="copy" />
                Copy
              </HereButton>

              <HereButton style={{ flex: 2 }} onClick={() => setSeed(generateMnemonic())}>
                <Icon name="refresh" />
                Generate new
              </HereButton>
            </div>

            <ActionButton style={{ flex: 1, marginTop: 22 }} onClick={() => selectSeed(seed)} disabled={isCreating}>
              Continue
            </ActionButton>
          </WordsWrap>
        </Card>
      </Page>
    </Root>
  );
};

export default observer(CreateAccount);
