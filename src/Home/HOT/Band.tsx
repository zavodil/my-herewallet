import React from "react";
import { useNavigate } from "react-router-dom";

import { notify } from "../../core/toast";
import { useWallet } from "../../core/Accounts";

import { ActionButton, Button } from "../../uikit";
import { BoldP, H0, H1, H2, H3, LargeP, SmallText, Text } from "../../uikit/typographic";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";

import { Container, Root } from "../styled";
import { observer } from "mobx-react-lite";
import { InviteFriend } from "./modals";

const Band = () => {
  const user = useWallet()!;
  const navigate = useNavigate();

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

      <div style={{ width: "100%", padding: "16px 20px", background: colors.elevation0, textAlign: "center" }}>
        <Button style={{ position: "absolute" }} onClick={() => navigate("/hot", { replace: true })}>
          <Icon name="arrow-left" />
        </Button>

        <BoldP>My Band</BoldP>
      </div>

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
          }}
        >
          <H3>{user.hot.referrals.length} Friend</H3>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img style={{ width: 24, height: 24, marginLeft: -16 }} src={require("../../assets/hot/hot.png")} />
            <BoldP>≈{user.hot.referralsEarnPerHour} per hour</BoldP>
          </div>

          <Text style={{ color: colors.blackSecondary }}>
            Every time your friend claims
            <br />
            HOT you get 20% cashback
          </Text>

          <Button>
            <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>Full guide</SmallText>
          </Button>
        </div>

        {user.hot.referrals.length > 0 && (
          <>
            <H3>My friend</H3>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                background: "rgba(243, 235, 234, 0.60)",
                padding: 16,
                gap: 24,
              }}
            ></div>
          </>
        )}

        <ActionButton
          style={{ position: "fixed", bottom: 24, width: "calc(100% - 32px)" }}
          onClick={() => sheets.present({ id: "Invite", element: <InviteFriend /> })}
        >
          Invite a Friend
        </ActionButton>
      </Container>
    </Root>
  );
};

export default observer(Band);
