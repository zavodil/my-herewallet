import React from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";
import { BoldP, H1, LargeP } from "../uikit/typographic";
import { ActionButton, Button } from "../uikit";
import { IntroImage, Root } from "./styled";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <Root style={{ padding: 24 }}>
      <Button $id="Auth.importAccount" onClick={() => navigate("/auth/import")} style={{ position: "absolute", right: 24, top: 24 }}>
        <BoldP>Log in</BoldP>
      </Button>

      <IntroImage style={{ marginTop: "auto" }}>
        <img src={introImage} />
        <img src={introImage} />
      </IntroImage>

      <H1 style={{ marginTop: 56 }}>NEAR Wallet</H1>
      <LargeP style={{ marginTop: 24, textAlign: "center" }}>Secure telegram wallet for NEAR Protocol</LargeP>

      <ActionButton $id="Auth.createAccount" big style={{ marginTop: "auto" }} onClick={() => navigate("/auth/create")}>
        Create new account
      </ActionButton>
    </Root>
  );
};

export default observer(Auth);
