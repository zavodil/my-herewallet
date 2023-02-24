import React, { useEffect } from "react";
import OtterSecLogo from "jsx:../assets/otter-logo.svg";
import { ActionButton, H2, Text } from "../uikit";
import { useWallet } from "../core/useWallet";
import * as S from "./styled";
import { useAnalytics } from "../core/analytics";

export const StartStaking = () => {
  const { selectorModal } = useWallet();
  const track = useAnalytics("login_screen");

  return (
    <S.CardView>
      <img style={{ width: 164, height: 235, marginTop: -48 }} src={require("../assets/staking.png")} />
      <H2 style={{ textAlign: "center" }}>
        Earn up to 10% APY
        <br />
        by holding NEAR
      </H2>
      <Text style={{ textAlign: "center", marginTop: 16, marginBottom: 54 }}>
        We use staking with instant liquidity. This allows you to{" "}
        <b>withdraw money instantly with 0% fee</b> and receive permanent passive income
      </Text>
      <ActionButton
        style={{ marginTop: "auto" }}
        onClick={() => {
          track("open_selector");
          selectorModal?.show();
        }}
      >
        Open wallet selector
      </ActionButton>
      <S.OnboardSecText as="a" href="https://osec.io/" target="_blank" rel="noopener noreferrer">
        Secure. Audited by <OtterSecLogo />
      </S.OnboardSecText>
    </S.CardView>
  );
};
