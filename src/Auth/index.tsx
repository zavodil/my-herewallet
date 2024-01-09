import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { isMobile } from "is-mobile";

import hereLogo from "../assets/here-logo2.svg?url";
import metamaskIcon from "../assets/metamask.svg?url";
import introImage from "../assets/intro.png";

import { accounts } from "../core/Accounts";
import { BoldP, H1, SmallText } from "../uikit/typographic";
import { ButtonCard, Card, IntroImage, Page, Root } from "./styled";
import Header from "../Home/Header";
import CreateNickname from "./CreateNickname";

const Auth = () => {
  const navigate = useNavigate();
  const [showNickname, setShowNickname] = useState(false);

  if (showNickname) {
    return <CreateNickname />;
  }

  return (
    <Root>
      <Header />
      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <Card style={{ width: "100%", maxWidth: 438 }}>
          <H1>Get started!</H1>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ButtonCard onClick={() => navigate("/auth/create")}>
              <img style={{ objectFit: "contain" }} width="48" height="48" src={hereLogo} />
              <div>
                <BoldP>Create new account</BoldP>
                <SmallText>Free nickname</SmallText>
              </div>
            </ButtonCard>

            <ButtonCard onClick={() => navigate("/auth/import")}>
              <img style={{ objectFit: "contain" }} width="48" height="48" src={require("../assets/import-seed.svg")} />
              <div>
                <BoldP>Import via seed phrase</BoldP>
                <SmallText>Or private key</SmallText>
              </div>
            </ButtonCard>

            <ButtonCard onClick={() => accounts.connectHere().then(() => navigate("/"))}>
              <img style={{ objectFit: "contain" }} width="48" height="48" src={hereLogo} />
              <div>
                <BoldP>Login via HERE Wallt</BoldP>
                <SmallText>Mobile wallet</SmallText>
              </div>
            </ButtonCard>

            <ButtonCard onClick={() => accounts.connectLedger().then(() => navigate("/"))}>
              <img
                width="64"
                height="64"
                style={{ objectFit: "contain", marginLeft: -4 }}
                src={require("../assets/ledger.png")}
              />
              <div style={{ marginLeft: -12 }}>
                <BoldP>Login via Ledger</BoldP>
                <SmallText>Hardware wallet</SmallText>
              </div>
            </ButtonCard>

            {!isMobile() && (
              <ButtonCard
                onClick={async () => {
                  const needNickname = await accounts.connectSnap();
                  if (needNickname) setShowNickname(true);
                  else navigate("/");
                }}
              >
                <img style={{ objectFit: "contain" }} width="48" height="48" src={metamaskIcon} />
                <div>
                  <BoldP>Log in with NEAR MetaMask Snap</BoldP>
                  <SmallText>Sponsored by BANYAN Collective</SmallText>
                </div>
              </ButtonCard>
            )}
          </div>
        </Card>
      </Page>
    </Root>
  );
};

export default observer(Auth);
