import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import Header from "../Header";
import { storage } from "../../core/Storage";
import { formatAmount } from "../../core/helpers";
import { accounts, useWallet } from "../../core/Accounts";
import { notify } from "../../core/toast";
import { NeedMoreGas } from "../NeedGas";

import { useNavigateBack } from "../../useNavigateBack";
import { Card, Container, Root, TokenIcon } from "../styled";
import { BoldP, LargeP, SmallText, Text, TinyText } from "../../uikit/typographic";
import { ActivityIndicator, Button } from "../../uikit";
import { HereButton } from "../../uikit/button";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";

import { useRecoveryInviter } from "./BindReferral";
import { runParticles, stopParticles } from "./effects/flame";
import { ClaimingLoading, FirstClaimHOT } from "./modals";
import Balance from "./Balance";

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
  const [isCreating, setCreating] = useState(false);

  useRecoveryInviter();
  useEffect(() => {
    runParticles();
    sparksRef.current?.stop();
    return () => {
      stopParticles();
    };
  }, []);

  useEffect(() => {
    if (user.hot.userData.claim_active !== false) return;
    sheets.present({ id: "Register", element: <FirstClaimHOT />, blocked: true });
  }, [user.hot.userData.claim_active]);

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

      if (e?.toString()?.includes("does not exist while viewing")) {
        notify(`Account ${user.near.accountId} is not activated`);
        const cred = storage.getAccount(user.near.accountId);

        if (cred?.publicKey) {
          try {
            notify(`Trying activate...`);
            setCreating(true);
            await accounts.allocateHotNickname(cred.publicKey, user.near.accountId);
            notify("Account activated, try claim again please");
            setCreating(false);
            setClaiming(false);
            return;
          } catch (e: any) {
            notify(e?.toString?.());
            setCreating(false);
            setClaiming(false);
            return;
          }
        } else {
          notify(`Public key not found`);
        }
      }

      if (!charge_gas_fee && e?.toString()?.includes("does not have enough balance")) {
        sheets.present({ id: "NeedGas", element: <NeedMoreGas onSelectHot={() => claim(true)} /> });
        setClaiming(false);
        return;
      }

      notify(e?.toString?.());
      setClaiming(false);
    }
  };

  if (isCreating) {
    return <ClaimingLoading time={30} text="Creating an account" />;
  }

  const isOverload = user.hot.miningProgress === 1;
  const [left, right] = (+user.hot.balance.toFixed(6)).toString().split(".");

  return (
    <Root style={{ overflow: "hidden", width: "100vw", height: "100%" }}>
      <img src={require("../../assets/hot/hot-blur.png")} style={{ position: "fixed", width: "100vw", top: -100, height: "100vh", objectFit: "contain" }} />

      <div id="particles-js" style={{ position: "fixed", width: "100vw", height: "100vh" }} />
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header />
        <Container style={{ zIndex: 10, justifyContent: "space-between", height: "100%", paddingBottom: 32 }}>
          {/* <div style={{ overflowX: "auto", width: "100vw", display: "flex", marginLeft: -16, padding: "0 16px", gap: 8 }}>
            {user.hot.village != null && (
              <Card style={{ width: "calc(100vw - 32px)", flexShrink: 0, padding: 12, alignItems: "center", flexDirection: "row", gap: 8 }} onClick={() => navigate("/hot/villages")}>
                <TokenIcon src={user.hot.village?.avatar} />
                <div>
                  <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>{user.hot.village?.name || user.hot.village?.username || "Unnamed vilalge"}</SmallText>
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
                <div style={{ marginTop: -5 }}>
                  <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>Explore villages</SmallText>
                  <TinyText>Join or create your own</TinyText>
                </div>

                <Icon style={{ marginLeft: "auto" }} name="cursor-right" />
              </Card>
            )}
          </div> */}
          <div />

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <Lottie
              loop={false}
              lottieRef={sparksRef as any}
              style={{ position: "absolute", transform: "scale(1.5)", top: 0, pointerEvents: "none" }}
              animationData={require("../../assets/hot/sparks.json")}
            />

            <LargeP style={{ top: 24, color: colors.blackSecondary }}>In storage:</LargeP>
            <Balance value={user.hot.earned} />

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: colors.blackSecondary, marginTop: -2, marginRight: 8 }}>HOT Balance:</Text>
              <img style={{ width: 18, flexShrink: 0, objectFit: "contain", marginTop: -2, marginRight: 2 }} src={require("../../assets/hot/hot.png")} />
              <Text style={{ fontFamily: "SF Mono" }}>
                {left}
                <span style={{ fontFamily: "CabinetGrotesk", fontWeight: "900" }}>.</span>
                {right}
              </Text>
            </div>

            {/* <div style={{ background: colors.orange, opacity: isOverload ? 0.5 : 1, border: "1px solid var(--Black-Primary)", padding: "4px 12px", borderRadius: 8 }}>
              <Text>+{user.hot.hotPerHour} per hour</Text>
            </div> */}

            <div style={{ width: "100%", marginTop: 64, borderRadius: 24, background: "linear-gradient(90deg, #FBC56A 0%, #FE910F 100%)" }}>
              <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden", margin: isOverload ? 1 : 0, paddingTop: 0, padding: 0, border: isOverload ? "none" : undefined }}>
                <div style={{ background: "#D9CDCB", height: 8, width: "100%" }}>
                  <div style={{ width: 4, background: "rgb(107 102 97 / 40%)", height: 8, left: `45%`, position: "absolute" }} />
                  <div style={{ position: "relative", width: `${user.hot.miningProgress * 100}%`, background: "linear-gradient(90deg, #FBC56A 0%, #FE910F 100%)", height: 8 }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", padding: 16, width: "100%", gap: 8 }}>
                  <img style={{ width: 56, height: 56, objectFit: "contain" }} src={user.hot.storageBooster?.icon} />

                  <div style={{ textAlign: "left", flexShrink: 0 }}>
                    <BoldP style={{ marginTop: -4 }}>Storage</BoldP>

                    {!isOverload ? (
                      <SmallText style={{ fontWeight: "bold", color: colors.blackSecondary }}>{formatHours(+user.hot.remainingMiningHours)} to fill</SmallText>
                    ) : (
                      <SmallText style={{ fontWeight: "bold", color: colors.blackSecondary }}>Filled</SmallText>
                    )}

                    <TinyText style={{ fontWeight: "bold" }}>{user.hot.hotPerHour} HOT/hour</TinyText>
                  </div>

                  <div style={{ marginLeft: "auto", marginTop: -4 }}>
                    <HereButton $id="claimHot" onClick={() => claim()} disabled={isClaiming || user.hot.miningProgress < 0.45}>
                      {isClaiming ? <ActivityIndicator width={6} style={{ transform: "scale(0.3)" }} /> : "Claim HOT"}
                    </HereButton>
                  </div>
                </div>
              </Card>

              {isOverload && <SmallText style={{ color: colors.blackPrimary, fontWeight: "bold", margin: "8px 0" }}>Claim hot from storage to keep mining</SmallText>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <Button $id="howToMineHot" onClick={() => window.Telegram.WebApp.openLink("https://www.herewallet.app/blog/how-to-mine-HOT")}>
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
                <TinyText>Boost</TinyText>
              </div>

              <div style={{ width: 1, height: 40, background: "#D9CDCB" }} />

              <div style={{ padding: "8px 12px", width: 65, textAlign: "center", cursor: "pointer" }} onClick={() => navigate("/hot/band")}>
                <img src={require("../../assets/hot/band.png")} style={{ width: 32, height: 32 }} />
                <TinyText>Friends</TinyText>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    </Root>
  );
};

export default observer(HOT);
