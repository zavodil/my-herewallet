import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

import Header from "../Header";
import { Card, Container, Root, TokenIcon } from "../styled";
import { useWallet } from "../../core/Accounts";
import { notify } from "../../core/toast";

import { BoldP, H0, LargeP, SmallText, Text, TinyText } from "../../uikit/typographic";
import { HereButton } from "../../uikit/button";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";
import { Button } from "../../uikit";

import { ClaimingLoading, FirstClaimHOT } from "./modals";
import { useScrollLock } from "../../useNavigateBack";

const formatHours = (hh: number) => {
  const mm = `${Math.round((hh * 60) % 60)}m`;
  return Math.floor(hh) ? `${Math.floor(hh)}h ${mm}` : mm;
};

const HOT = () => {
  useScrollLock();
  const user = useWallet()!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.hot.needRegister) return;
    sheets.present({ id: "Register", element: <FirstClaimHOT />, blocked: true });
  }, [user.hot.needRegister]);

  const claim = async () => {
    if (user.hot.miningProgress !== 1) return;
    sheets.present({ id: "Claiming", element: <ClaimingLoading text="Claiming..." />, fullscreen: true });
    await user.hot.claim().catch((e) => {
      console.log(e);
      notify("Claim failed");
    });

    sheets.dismiss("Claiming");
  };

  return (
    <Root style={{ overflow: "hidden", width: "100vw" }}>
      <img
        src={require("../../assets/hot/hot-blur.png")}
        style={{ position: "fixed", width: "100vw", top: -100, height: "100vh", objectFit: "contain" }}
      />

      <Header />

      <Container
        style={{ zIndex: 10, justifyContent: "space-between", minHeight: "calc(var(--vh, 1vh) * 100 - 56px)" }}
      >
        <Card style={{ padding: 12, alignItems: "center", flexDirection: "row", gap: 8 }}>
          <TokenIcon src={require("../../assets/hot/hot-icon.png")} />
          <div>
            <TinyText>Minted</TinyText>
            <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>
              {user.hot.totalMinted} / 10,000M
            </SmallText>
          </div>
        </Card>

        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LargeP style={{ color: colors.blackSecondary }}>Your balance</LargeP>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              style={{ width: 60, height: 60, marginTop: -8, marginLeft: -16 }}
              src={require("../../assets/hot/hot.png")}
            />
            <H0>{Math.max(0, user.hot.balance)}</H0>
          </div>

          <div
            style={{
              background: colors.orange,
              border: "1px solid var(--Black-Primary)",
              padding: "4px 12px",
              borderRadius: 8,
            }}
          >
            <Text>+{user.hot.hotPerHour} per hour</Text>
          </div>

          <Card
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              padding: "24px 16px",
              paddingRight: 20,
              paddingTop: 32,
              marginTop: 64,
              position: "relative",
              overflow: "hidden",
              width: "100%",
              gap: 12,
            }}
          >
            <img style={{ width: 48, height: 48 }} src={user.hot.getBooster(user.hot.state?.storage || 0)?.icon} />

            <div style={{ textAlign: "left" }}>
              <BoldP>Storage</BoldP>
              {user.hot.miningProgress !== 1 ? (
                <Text style={{ color: colors.blackSecondary }}>
                  ≈{formatHours(+user.hot.remainingMiningHours)} to fill
                </Text>
              ) : (
                <Text style={{ color: colors.blackSecondary }}>Filled</Text>
              )}
            </div>

            <HereButton disabled={user.hot.miningProgress !== 1} onClick={() => claim()} style={{ marginLeft: "auto" }}>
              Claim HOT
            </HereButton>

            <div style={{ background: "#D9CDCB", height: 8, width: "100%", position: "absolute", top: 0, left: 0 }}>
              <div
                style={{
                  width: `${user.hot.miningProgress * 100}%`,
                  background: "linear-gradient(90deg, #FBC56A 0%, #FE910F 100%)",
                  height: 8,
                }}
              />
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <Button>
            <BoldP style={{ color: "#0258F7" }}>How to mine HOT Coin</BoldP>
          </Button>

          <Card
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "fit-content",
              padding: "0px 16px",
              gap: 8,
            }}
          >
            <div style={{ padding: "8px 12px", width: 65, textAlign: "center" }} onClick={() => navigate("/hot/gas")}>
              <img src={require("../../assets/hot/gas.png")} style={{ width: 32, height: 32 }} />
              <TinyText>Gas</TinyText>
            </div>

            <div style={{ width: 1, height: 40, background: "#D9CDCB" }} />

            <div style={{ padding: "8px 12px", width: 65, textAlign: "center" }} onClick={() => navigate("/hot/cave")}>
              <img src={user.hot.getBooster(user.hot.state?.boost || 0)?.icon} style={{ width: 32, height: 32 }} />
              <TinyText>Cave</TinyText>
            </div>

            <div style={{ width: 1, height: 40, background: "#D9CDCB" }} />

            <div style={{ padding: "8px 12px", width: 65, textAlign: "center" }} onClick={() => navigate("/hot/band")}>
              <img src={require("../../assets/hot/band.png")} style={{ width: 32, height: 32 }} />
              <TinyText>Band</TinyText>
            </div>
          </Card>
        </div>
      </Container>
    </Root>
  );
};

export default observer(HOT);
