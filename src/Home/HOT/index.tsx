import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import Header from "../Header";
import { Card, Container, Root, TokenIcon } from "../styled";
import { useWallet } from "../../core/Accounts";
import { notify } from "../../core/toast";
import { NeedMoreGas } from "../NeedGas";

import { useNavigateBack } from "../../useNavigateBack";
import { BoldP, H0, LargeP, SmallText, Text, TinyText } from "../../uikit/typographic";
import { ActivityIndicator, Button } from "../../uikit";
import { HereButton } from "../../uikit/button";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";

import { runParticles, stopParticles } from "./effects/flame";
import { FirstClaimHOT } from "./modals";
import { formatAmount } from "../../core/helpers";
import Balance from "./Balance";
import Icon from "../../uikit/Icon";

const formatHours = (hh: number) => {
  const mm = `${Math.round((hh * 60) % 60)}m`;
  return Math.floor(hh) ? `${Math.floor(hh)}h ${mm}` : mm;
};

const HOT = () => {
  useNavigateBack();
  const user = useWallet()!;
  const navigate = useNavigate();
  const sparksRef = useRef<LottieRefCurrentProps>();
  const [isClaiming, setClaiming] = useState(false);

  useEffect(() => {
    runParticles();
    sparksRef.current?.stop();
    return () => {
      stopParticles();
    };
  }, []);

  useEffect(() => {
    if (!user.hot.needRegister) return;
    sheets.present({ id: "Register", element: <FirstClaimHOT />, blocked: true });
  }, [user.hot.needRegister]);

  const claim = async (charge_gas_fee?: boolean) => {
    if (isClaiming) return;
    sheets.dismiss("NeedGas");
    window.Telegram.WebApp?.HapticFeedback?.impactOccurred?.("light");

    try {
      setClaiming(true);
      await user.hot.claim(charge_gas_fee);
      sparksRef.current?.goToAndPlay(0);
      sparksRef.current?.setSpeed(1.3);
      window.Telegram.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      setClaiming(false);
    } catch (e: any) {
      window.Telegram.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      if (!charge_gas_fee && e?.toString()?.includes("does not have enough balance")) {
        sheets.present({ id: "NeedGas", element: <NeedMoreGas onSelectHot={() => claim(true)} /> });
        setClaiming(false);
        return;
      }

      notify("Claim failed");
      setClaiming(false);
    }
  };

  const isOverload = user.hot.miningProgress === 1;

  return (
    <Root style={{ overflow: "hidden", width: "100vw", height: "100%" }}>
      <img src={require("../../assets/hot/hot-blur.png")} style={{ position: "fixed", width: "100vw", top: -100, height: "100vh", objectFit: "contain" }} />

      <div id="particles-js" style={{ position: "fixed", width: "100vw", height: "100vh" }} />
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header />

        <Container style={{ zIndex: 10, justifyContent: "space-between", height: "100%", paddingBottom: 32 }}>
          <div style={{ overflowX: "auto", width: "100vw", display: "flex", marginLeft: -16, padding: "0 16px", gap: 8 }}>
            {user.hot.village != null && (
              <Card style={{ width: "calc(100vw - 32px)", flexShrink: 0, padding: 12, alignItems: "center", flexDirection: "row", gap: 8 }} onClick={() => navigate("/hot/villages")}>
                <TokenIcon src={user.hot.village?.avatar} />
                <div>
                  <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>{user.hot.village?.name}</SmallText>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: -2, marginLeft: -2 }}>
                    <img src={require("../../assets/hot/hot.png")} style={{ marginTop: -2, width: 16, height: 16 }} />
                    <Text style={{ color: colors.blackPrimary, fontFamily: "SF Mono" }}>{formatAmount(user.hot.village.hot_balance, 6)}</Text>
                  </div>
                </div>

                <Icon style={{ marginLeft: "auto" }} name="cursor-right" />
              </Card>
            )}

            {user.hot.village == null && (
              <Card style={{ width: "calc(100vw - 32px)", flexShrink: 0, padding: 12, alignItems: "center", flexDirection: "row", gap: 8 }} onClick={() => navigate("/hot/villages")}>
                <TokenIcon src={require("../../assets/hot/fire/1.png")} />
                <div style={{ marginTop: -2 }}>
                  <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>Explore villages</SmallText>
                  <TinyText>Join or create your own</TinyText>
                </div>

                <Icon style={{ marginLeft: "auto" }} name="cursor-right" />
              </Card>
            )}
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <Lottie
              loop={false}
              lottieRef={sparksRef as any}
              style={{ position: "absolute", transform: "scale(1.5)", top: 0, pointerEvents: "none" }}
              animationData={require("../../assets/hot/sparks.json")}
            />

            <LargeP style={{ top: 24, color: colors.blackSecondary }}>Your balance</LargeP>
            <Balance />

            <div style={{ background: colors.orange, opacity: isOverload ? 0.5 : 1, border: "1px solid var(--Black-Primary)", padding: "4px 12px", borderRadius: 8 }}>
              <Text>+{user.hot.hotPerHour} per hour</Text>
            </div>

            <div style={{ width: "100%", marginTop: 64, borderRadius: 24, background: "linear-gradient(90deg, #FBC56A 0%, #FE910F 100%)" }}>
              <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden", margin: isOverload ? 1 : 0, paddingTop: 0, padding: 0, border: isOverload ? "none" : undefined }}>
                <div style={{ background: "#D9CDCB", height: 8, width: "100%" }}>
                  <div
                    style={{
                      width: `${user.hot.miningProgress * 100}%`,
                      background: "linear-gradient(90deg, #FBC56A 0%, #FE910F 100%)",
                      height: 8,
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", padding: "24px 16px", paddingRight: 20, paddingTop: 24, width: "100%", gap: 12 }}>
                  <img style={{ width: 48, height: 48 }} src={user.hot.getBooster(user.hot.state?.storage || 0)?.icon} />

                  <div style={{ textAlign: "left" }}>
                    <BoldP>Storage</BoldP>
                    {!isOverload ? (
                      <Text style={{ color: colors.blackSecondary }}>≈{formatHours(+user.hot.remainingMiningHours)} to fill</Text>
                    ) : (
                      <Text style={{ color: colors.blackSecondary }}>Filled</Text>
                    )}
                  </div>

                  <HereButton onClick={() => claim()} style={{ marginLeft: "auto" }} disabled={isClaiming}>
                    {isClaiming ? <ActivityIndicator width={6} style={{ transform: "scale(0.3)" }} /> : "Claim HOT"}
                  </HereButton>
                </div>
              </Card>

              {isOverload && <SmallText style={{ color: colors.blackPrimary, fontWeight: "bold", margin: "8px 0" }}>Claim hot from storage to keep minig</SmallText>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <Button>
              <BoldP style={{ color: "#0258F7" }}>How to mine HOT</BoldP>
            </Button>

            <Card style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "fit-content", padding: "0px 16px", gap: 8 }}>
              <div style={{ padding: "8px 12px", width: 65, textAlign: "center", cursor: "pointer" }} onClick={() => navigate("/hot/gas")}>
                <img src={require("../../assets/hot/gas.png")} style={{ width: 32, height: 32 }} />
                <TinyText>{user.hot.userData.gas_free_transactions} Gas</TinyText>
              </div>

              <div style={{ width: 1, height: 40, background: "#D9CDCB" }} />

              <div style={{ padding: "8px 12px", width: 65, textAlign: "center", cursor: "pointer" }} onClick={() => navigate("/hot/cave")}>
                <img src={user.hot.getBooster(user.hot.state?.boost || 0)?.icon} style={{ width: 32, height: 32 }} />
                <TinyText>Cave</TinyText>
              </div>

              <div style={{ width: 1, height: 40, background: "#D9CDCB" }} />

              <div style={{ padding: "8px 12px", width: 65, textAlign: "center", cursor: "pointer" }} onClick={() => navigate("/hot/band")}>
                <img src={require("../../assets/hot/band.png")} style={{ width: 32, height: 32 }} />
                <TinyText>Band</TinyText>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    </Root>
  );
};

export default observer(HOT);
