import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";
import { accounts } from "../core/Accounts";

import { generateMnemonic } from "../core/near-chain/passphrase/bip39";
import { H1, Text, LargeP } from "../uikit/typographic";
import { ActionButton } from "../uikit";
import { colors } from "../uikit/theme";
import Header from "../Home/Header";

import { IntroImage, Page, Root, WordItem, WordsWrap } from "./styled";
import { HereButton } from "../uikit/button";
import Icon from "../uikit/Icon";
import { notify } from "../core/toast";
import CreateNickname from "./CreateNickname";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [selectedSeed, selectSeed] = useState<string | null>(null);
  const [seed, setSeed] = useState<string | null>(() => generateMnemonic());

  if (selectedSeed) {
    return (
      <CreateNickname onCreate={(nickname) => accounts.connectWeb(selectedSeed, nickname).then(() => navigate("/"))} />
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

        <div style={{ width: "100%", maxWidth: 420 }}>
          <div>
            <H1>
              Setup Your
              <br />
              Secure Passphrase
            </H1>
            <Text style={{ marginTop: 8 }}>
              Write down the following words in order and keep them somewhere safe.{" "}
              <span style={{ fontWeight: "bold" }}>
                Anyone with access to it will also have access to your account!
              </span>{" "}
              You can access this words later in the settings
            </Text>
          </div>

          <WordsWrap style={{ marginTop: 40 }}>
            {seed?.split(" ").map((item, i) => (
              <WordItem key={i}>{item}</WordItem>
            ))}

            <div style={{ marginTop: 12, width: "100%", display: "flex", gap: 24, justifyContent: "space-between" }}>
              <HereButton
                style={{ flex: 1, background: colors.yellow }}
                onClick={async () => {
                  await navigator.clipboard.writeText(seed!);
                  notify("Account address has beed copied");
                }}
              >
                <Icon name="copy" />
                Copy
              </HereButton>

              <HereButton style={{ flex: 2, background: colors.pink }} onClick={() => setSeed(generateMnemonic())}>
                <Icon name="refresh" />
                Generate new
              </HereButton>
            </div>

            <ActionButton style={{ flex: 1, marginTop: 22 }} onClick={() => selectSeed(seed)}>
              Continue
            </ActionButton>
          </WordsWrap>
        </div>
      </Page>
    </Root>
  );
};

export default observer(CreateAccount);
