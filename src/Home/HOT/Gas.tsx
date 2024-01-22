import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useWallet } from "../../core/Accounts";
import { useNavigateBack } from "../../useNavigateBack";
import { BoldP, H3, SmallText, Text } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import { Container, Root } from "../styled";
import { sheets } from "../../uikit/Popup";
import { Button } from "../../uikit";
import Icon from "../../uikit/Icon";
import MyAddress from "../MyAddress";

const Gas = () => {
  useNavigateBack();
  const user = useWallet()!;
  const navigate = useNavigate();

  const depositNear = () => {
    sheets.present({ id: "MyQR", element: <MyAddress /> });
  };

  const send69Hot = () => {
    navigate("/transfer?asset=HOT&amount=69");
  };

  return (
    <Root>
      <div
        style={{
          zIndex: 1,
          borderRadius: "50%",
          width: "100vw",
          height: 788,
          opacity: 0.5,
          background: "#FDBF1C",
          filter: "blur(200px)",
          position: "fixed",
          left: "-50vw",
          marginLeft: "50%",
          bottom: -788 / 2,
        }}
      />

      <div
        style={{
          zIndex: 1,
          borderRadius: "50%",
          width: "100vw",
          height: 582,
          opacity: 0.5,
          background: "#FD6D1C",
          filter: "blur(150px)",
          position: "fixed",
          left: "-50vw",
          marginLeft: "50%",
          bottom: -582 / 2,
        }}
      />

      <img src={require("../../assets/hot/stars.png")} style={{ position: "fixed", top: 56, width: "100vw" }} />

      <Container style={{ zIndex: 10 }}>
        <div
          style={{
            display: "flex",
            padding: "36px 0",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 12,
            paddingBottom: 0,
          }}
        >
          <img src={require("../../assets/hot/gas.png")} style={{ width: 80, height: 80 }} />
          <H3>{user.hot.userData.gas_free_transactions} Gas-Free</H3>
          <Text style={{ color: colors.blackSecondary, padding: "0 32px" }}>
            Each HOT claim is a transaction on the NEAR blockchain. We will cover your gas price as long as you have
            gas-free transactions
          </Text>

          <Button>
            <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>Learn more</SmallText>
          </Button>
        </div>

        <Options>
          <div
            style={{ display: "flex", gap: 12, alignItems: "center" }}
            onClick={() => window.Telegram.WebApp.openLink("https://download.herewallet.app")}
          >
            <img
              src={require("../../assets/here.svg")}
              style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 8 }}
            />
            <div>
              <BoldP>Download mobile App</BoldP>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Icon name="gas" />
                <Text>5 Gas-Free Tx</Text>
              </div>
            </div>

            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => send69Hot()}>
            <img
              src={require("../../assets/hot/hot.png")}
              style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 12 }}
            />
            <div>
              <BoldP>Send 69 $HOT to a friend</BoldP>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Icon name="gas" />
                <Text>2 Gas-Free Tx</Text>
              </div>
            </div>
            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>

          <div
            style={{ display: "flex", gap: 12, alignItems: "center" }}
            onClick={() => window.Telegram.WebApp.openLink("https://download.herewallet.app")}
          >
            <img
              src={require("../../assets/hot/band.png")}
              style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 8, paddingLeft: 12 }}
            />
            <div>
              <BoldP>Follow us on Telegram</BoldP>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Icon name="gas" />
                <Text>1 Gas-Free Tx</Text>
              </div>
            </div>

            <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
          </div>
        </Options>

        <Options>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={depositNear}>
            <img
              src={require("../../assets/near.svg")}
              style={{ width: 64, height: 64, borderRadius: 12, background: "#fff" }}
            />

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

export default Gas;
