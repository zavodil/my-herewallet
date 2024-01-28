import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";

import { HotReferral } from "../../core/Hot";
import { useWallet } from "../../core/Accounts";
import { ActionButton, Button } from "../../uikit";
import { BoldP, H3, SmallText, Text } from "../../uikit/typographic";
import { useNavigateBack } from "../../useNavigateBack";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";

import { Container, Root } from "../styled";
import { InviteFriend } from "./modals";
import BlurBackground from "./effects/BlurBackground";

const FriendItem = ({ item }: { item: HotReferral }) => {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F3EBEA",
          borderRadius: 12,
          width: 64,
          height: 64,
        }}
      >
        {item.avatar ? <img src={item.avatar} style={{ width: 64, height: 64, objectFit: "cover" }} /> : <H3>{item.telegram_username.charAt(0).toUpperCase()}</H3>}
      </div>

      <div>
        <BoldP>{item.telegram_username}</BoldP>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, marginLeft: -4 }}>
          <img style={{ width: 24, height: 24 }} src={require("../../assets/hot/hot.png")} />
          <BoldP>{item.hot_balance}</BoldP>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
        <BoldP style={{ marginLeft: "auto" }}>+{+(item.earn_per_hour * 0.2).toFixed(2)}</BoldP>
        <img style={{ width: 24, height: 24 }} src={require("../../assets/hot/hot.png")} />
      </div>
    </div>
  );
};

const Band = () => {
  useNavigateBack();
  const user = useWallet()!;

  useEffect(() => {
    user.hot.fetchReferrals();
    window.Telegram.WebApp.setBackgroundColor?.("#f6b380");
    return () => window.Telegram.WebApp.setBackgroundColor?.(colors.elevation1);
  }, []);

  return (
    <>
      <Root style={{ height: "100%", overflowY: "auto", paddingBottom: 100 }}>
        <BlurBackground />
        <img src={require("../../assets/hot/stars.png")} style={{ position: "fixed", top: 56, width: "100vw" }} />

        <Container style={{ zIndex: 10 }}>
          <div style={{ display: "flex", padding: "36px", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12 }}>
            <H3>{user.hot.referrals?.length} Friend</H3>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img style={{ width: 24, height: 24, marginLeft: -16 }} src={require("../../assets/hot/hot.png")} />
              <BoldP>≈{+user.hot.referralsEarnPerHour.toFixed(2)} per hour</BoldP>
            </div>

            <Text style={{ color: colors.blackSecondary }}>
              Every time your friend claims HOT you get <b>20%</b> cashback. And <b>5%</b> every time his referrals claim it
            </Text>

            <Button>
              <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>Full guide</SmallText>
            </Button>
          </div>

          {user.hot.referrals?.length > 0 && (
            <div style={{ width: "100%" }}>
              <H3>My friend</H3>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", borderRadius: 16, background: "rgba(243, 235, 234, 0.60)", padding: 16, gap: 24 }}>
                {user.hot.referrals?.map?.((item) => (
                  <FriendItem key={item.account_id} item={item} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </Root>

      <ActionButton style={{ position: "absolute", bottom: 16, width: "calc(100% - 32px)", left: 16, zIndex: 1000 }} onClick={() => sheets.present({ id: "Invite", element: <InviteFriend /> })}>
        Invite a Friend
      </ActionButton>
    </>
  );
};

export default observer(Band);
