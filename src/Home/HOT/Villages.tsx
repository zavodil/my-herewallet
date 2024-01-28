import React, { useEffect } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";

import { useWallet } from "../../core/Accounts";
import { formatAmount } from "../../core/helpers";
import { useNavigateBack } from "../../useNavigateBack";
import { BoldP, H3, SmallText, Text } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";
import { Button } from "../../uikit";

import { Container, Root } from "../styled";
import BlurBackground from "./effects/BlurBackground";

const Villages = () => {
  useNavigateBack();
  const user = useWallet()!;

  useEffect(() => {
    user.hot.fetchVillages();
    window.Telegram.WebApp.setBackgroundColor?.("#f6b380");
    return () => window.Telegram.WebApp.setBackgroundColor?.(colors.elevation1);
  }, []);

  return (
    <Root>
      <BlurBackground />
      <Container style={{ zIndex: 10 }}>
        <div style={{ textAlign: "center", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <img style={{ width: 80, height: 80 }} src={require("../../assets/hot/band.png")} />
          <H3 style={{ marginTop: 12 }}>Join village</H3>
          <Text style={{ marginTop: 4, padding: "0 24px", color: colors.blackSecondary }}>
            Village members can earn +5% HOT.
            <br />
            Best villages receive daily USDT giveaways
          </Text>
          <Button style={{ marginTop: 24 }} onClick={() => window.Telegram.WebApp.openTelegramLink("https://t.me/hereawalletbot?start=v")}>
            <SmallText style={{ fontWeight: "bold", color: "#0258F7" }}>Create a village</SmallText>
          </Button>
        </div>

        <H3 style={{ marginTop: 32 }}>Top villages</H3>
        {user.hot.villages.length > 0 && (
          <Options style={{ marginTop: -12 }}>
            {user.hot.villages.map((item) => (
              <div key={item.name} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img src={item.avatar} style={{ width: 64, height: 64, borderRadius: 12 }} />

                <div style={{ overflow: "hidden" }}>
                  <BoldP style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</BoldP>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", marginTop: 8, marginLeft: -2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginRight: 8 }}>
                      <img src={require("../../assets/hot/hot.png")} style={{ marginTop: -2, width: 24, height: 24 }} />
                      <Text style={{ color: colors.blackPrimary, fontFamily: "SF Mono" }}>{formatAmount(item.hot_balance, 6)}</Text>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: -4 }}>
                      <Icon strokeWidth={1} stroke={colors.blackPrimary} style={{ marginLeft: 8, width: 16 }} name="social" />
                      <Text style={{ color: colors.blackPrimary, fontFamily: "SF Mono" }}>{item.total_members}</Text>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Options>
        )}
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

export default observer(Villages);
