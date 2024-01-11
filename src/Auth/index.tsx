import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { isMobile } from "is-mobile";

import hereLogo from "../assets/here-logo2.svg?url";
import metamaskIcon from "../assets/metamask.svg?url";
import introImage from "../assets/intro.png";

import { accounts } from "../core/Accounts";
import { BoldP, H1, H3, SmallText, Text } from "../uikit/typographic";
import { ButtonCard, Card, IntroImage, Page, Root } from "./styled";
import Header from "../Home/Header";
import CreateNickname from "./CreateNickname";
import { colors } from "../uikit/theme";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <Root>
      <Header />
      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <div style={{ width: 488 }}>
          <H1>Add your first account!</H1>

          <Card
            style={{ marginTop: 32, height: 190, gap: 16, padding: "24px 28px", position: "relative" }}
            onClick={() => navigate("/auth/create")}
          >
            <H3>I want to create an account</H3>
            <Text style={{ marginTop: "auto", color: colors.blackSecondary }}>Create a new HERE Account</Text>
            <img
              width={273}
              height={183}
              style={{ objectFit: "contain", position: "absolute", right: -8, bottom: 0 }}
              src={require("../assets/here-create.png")}
            />
          </Card>

          <Card
            style={{ marginTop: 12, height: 190, gap: 16, padding: "24px 28px" }}
            onClick={() => navigate("/auth/import")}
          >
            <H3>I already have an account</H3>
            <img
              width={152}
              height={32}
              style={{ objectFit: "contain" }}
              src={require("../assets/import-wallets.png")}
            />
            <Text style={{ color: colors.blackSecondary }}>
              Import an existing account with Wallet selector, Metamask, HERE Account or backup
            </Text>
          </Card>

          {/* <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          </div> */}
        </div>
      </Page>
    </Root>
  );
};

export default observer(Auth);
