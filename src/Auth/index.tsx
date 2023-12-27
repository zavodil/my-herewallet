import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { isMobile } from "@here-wallet/core";

import hereWebLogo from "../assets/here-web.svg?url";
import hereLogo from "../assets/here-logo2.svg?url";
import metamaskIcon from "../assets/metamask.svg?url";
import introImage from "../assets/intro.png";

import { accounts } from "../core/Accounts";
import { ConnectType } from "../core/UserAccount";
import { BoldP, H0, LargeP, SmallText } from "../uikit/typographic";
import { ButtonCard, Card, Header, IntroImage, Page, Root } from "./styled";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (accounts.account == null) navigate("/");
  }, [accounts.account]);

  const register = async (type: ConnectType) => {
    const needNickname = await accounts.register(type);
    if (needNickname) navigate("/nickname");
  };

  return (
    <Root>
      <Header>
        <Link to="/">
          <img style={{ height: 22, objectFit: "contain" }} src={hereWebLogo} />
        </Link>

        <BoldP style={{ textAlign: "right" }} as="a" href="https://download.herewallet.app">
          Don’t have an account? <span style={{ textDecoration: "underline" }}>Click here</span>
        </BoldP>
      </Header>

      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <Card style={{ width: "100%", maxWidth: 438 }}>
          <div>
            <H0>Get started!</H0>
            <LargeP>Connect your wallet to view account details</LargeP>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ButtonCard onClick={() => register(ConnectType.Here)}>
              <img style={{ objectFit: "contain" }} width="48" height="48" src={hereLogo} />
              <BoldP>Log in with HERE Wallet</BoldP>
            </ButtonCard>

            {/* <ButtonCard style={{ marginTop: 16 }} onClick={() => accounts.register(ConnectType.Ledger)}>
            <img width="64" height="64" style={{ objectFit: "contain", marginLeft: -4 }} src={ledgerLogo} />
            <BoldP style={{ marginLeft: -12 }}>Log in with Ledger</BoldP>
          </ButtonCard> */}

            {!isMobile() && (
              <ButtonCard onClick={() => register(ConnectType.Snap)}>
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
