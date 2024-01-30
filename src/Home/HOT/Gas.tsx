import React, { useEffect } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";

import { gasFreeMissions } from "../../core/configs/hot";
import { useWallet } from "../../core/Accounts";
import { useNavigateBack } from "../../useNavigateBack";
import { BoldP, H3, SmallText, Text } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import { sheets } from "../../uikit/Popup";
import { Button } from "../../uikit";
import Icon from "../../uikit/Icon";

import { Container, Root } from "../styled";
import BlurBackground from "./effects/BlurBackground";
import MyAddress from "../MyAddress";

const Gas = () => {
  useNavigateBack();
  const user = useWallet()!;

  useEffect(() => {
    user.hot.fetchMissions();
    window.Telegram.WebApp.setBackgroundColor?.("#f6b380");
    return () => window.Telegram.WebApp.setBackgroundColor?.(colors.elevation1);
  }, []);

  const depositNear = () => {
    sheets.present({ id: "MyQR", element: <MyAddress /> });
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

          <Button $id="GasFree.learnMore">
            <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>Learn more</SmallText>
          </Button>
        </div>

        <Options>
          {gasFreeMissions.map((item) => (
            <div key={item.mission} style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => item.onClick(user)}>
              <img src={item.icon} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 12 }} />
              <div>
                <BoldP>{item.title}</BoldP>
                {user.hot.missions[item.mission] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <Icon color={colors.green} name="tick" />
                    <BoldP style={{ color: colors.green }}>Completed</BoldP>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <Icon name="gas" />
                    <BoldP>{item.gasFree} Gas-Free Tx</BoldP>
                  </div>
                )}
              </div>

              <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
            </div>
          ))}
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
