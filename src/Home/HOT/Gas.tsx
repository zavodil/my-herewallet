import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useWallet } from "../../core/Accounts";
import { useNavigateBack } from "../../useNavigateBack";
import { BoldP, H3, SmallText, Text } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import { sheets } from "../../uikit/Popup";
import { Button } from "../../uikit";
import Icon from "../../uikit/Icon";

import { Container, Root } from "../styled";
import MyAddress from "../MyAddress";
import BlurBackground from "./effects/BlurBackground";
import { observer } from "mobx-react-lite";

const Gas = () => {
  useNavigateBack();
  const user = useWallet()!;
  const navigate = useNavigate();

  useEffect(() => {
    user.hot.fetchMissions();
    window.Telegram.WebApp.setBackgroundColor?.("#f6b380");
    return () => window.Telegram.WebApp.setBackgroundColor?.(colors.elevation1);
  }, []);

  const depositNear = () => {
    sheets.present({ id: "MyQR", element: <MyAddress /> });
  };

  const send69Hot = () => {
    navigate("/transfer?asset=HOT&amount=0.69");
  };

  const followTwitter = () => {
    window.Telegram.WebApp.openLink("https://twitter.com/here_wallet");
    user.hot.completeMission("follow_twitter");
  };

  const followTelegram = () => {
    window.Telegram.WebApp.openTelegramLink("https://t.me/herewallet");
    setTimeout(() => {
      user.hot.completeMission("telegram_follow");
    }, 5000);
  };

  return (
    <Root>
      <BlurBackground />
      <img src={require("../../assets/hot/stars.png")} style={{ position: "fixed", top: 56, width: "100vw" }} />

      <Container style={{ zIndex: 10 }}>
        <div style={{ display: "flex", padding: "36px 0", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12, paddingBottom: 0 }}>
          <img src={require("../../assets/hot/gas.png")} style={{ width: 80, height: 80 }} />
          <H3>{user.hot.userData.gas_free_transactions} Gas-Free</H3>
          <Text style={{ color: colors.blackSecondary, padding: "0 32px" }}>
            Each HOT claim is a transaction on the NEAR blockchain. We will cover your gas price as long as you have gas-free transactions
          </Text>

          <Button>
            <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>Learn more</SmallText>
          </Button>
        </div>

        <Options>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => followTwitter()}>
            <img src={require("../../assets/here.svg")} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 8 }} />
            <div>
              <BoldP>Follow us on Twitter</BoldP>
              {user.hot.missions.follow_twitter ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Icon color={colors.green} name="tick" />
                  <BoldP style={{ color: colors.green }}>Completed</BoldP>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Icon name="gas" />
                  <BoldP>1 Gas-Free Tx</BoldP>
                </div>
              )}
            </div>

            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => send69Hot()}>
            <img src={require("../../assets/hot/hot.png")} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 12 }} />
            <div>
              <BoldP>Send 0.69 $HOT to a friend</BoldP>
              {user.hot.missions.send_69_hot ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Icon color={colors.green} name="tick" />
                  <BoldP style={{ color: colors.green }}>Completed</BoldP>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Icon name="gas" />
                  <BoldP>2 Gas-Free Tx</BoldP>
                </div>
              )}
            </div>
            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => followTelegram()}>
            <img src={require("../../assets/hot/band.png")} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 8, paddingLeft: 12 }} />
            <div>
              <BoldP>Follow us on Telegram</BoldP>

              {user.hot.missions.telegram_follow ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Icon color={colors.green} name="tick" />
                  <BoldP style={{ color: colors.green }}>Completed</BoldP>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Icon name="gas" />
                  <Text>1 Gas-Free Tx</Text>
                </div>
              )}
            </div>

            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>
        </Options>

        <Options>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={depositNear}>
            <img src={require("../../assets/near.svg")} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff" }} />

            <div>
              <BoldP>Deposit NEAR</BoldP>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Icon name="gas" />
                <Text>Unlimited</Text>
              </div>
            </div>

            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>
        </Options>
      </Container>
    </Root>
  );
};

const Options = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: rgba(243, 235, 234, 0.6);
  padding: 16px;
  gap: 24px;
`;

export default observer(Gas);
