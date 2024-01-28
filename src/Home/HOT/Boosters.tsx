import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { notify } from "../../core/toast";
import { useWallet } from "../../core/Accounts";
import { formatAmount } from "../../core/helpers";
import { ActionButton, ActivityIndicator, Button } from "../../uikit";
import { BoldP, H2, LargeP, SmallText, Text } from "../../uikit/typographic";
import { useNavigateBack } from "../../useNavigateBack";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";

import { Container, Root } from "../styled";
import { ClaimingLoading } from "./modals";
import Balance from "./Balance";
import BlurBackground from "./effects/BlurBackground";

const BoostPopup = observer(({ id }: { id: number }) => {
  const user = useWallet()!;
  const current = user.hot.getBooster(id);
  const next = user.hot.getBooster(id + 1);
  const [isLoading, setLoading] = useState(false);
  const [isChecking, setChecking] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  if (!next || !current) return null;

  const upgrade = async () => {
    try {
      setLoading(true);
      sheets.blocked("Boost", true);
      await user.hot.upgradeBooster(id + 1);
      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.log(e);
      sheets.blocked("Boost", false);
      notify("Upgrade failed");
      setLoading(false);
    }
  };

  const updateMissions = async () => {
    if (!next.mission) return;
    try {
      setChecking(true);
      await user.hot.completeMission(next.mission);
      setChecking(false);
    } catch (e) {
      if (e instanceof Error) notify(e.message);
      else notify("Mission not complete, try later");
      setChecking(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ height: "100%", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8 }}>
        <img src={next.icon} style={{ height: 200, objectFit: "cover" }} />

        <H2 style={{ marginTop: 16 }}>{next.title}</H2>
        <Text style={{ color: colors.blackSecondary }}>{next.text}</Text>

        <ActionButton style={{ marginTop: 24 }} onClick={() => sheets.dismiss("Boost")}>
          Got it
        </ActionButton>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
      <H2>{next.title}</H2>
      <Text style={{ marginTop: -16, color: colors.blackSecondary }}>{next.text}</Text>

      <div style={{ padding: "0 24px", width: "100%" }}>
        <div
          style={{
            borderRadius: 12,
            width: "100%",
            alignItems: "center",
            gap: 12,
            overflow: "hidden",
            border: "1px solid var(--border-low, #C7BAB8)",
            background: "linear-gradient(45deg, #FDBF1C55, transparent)",
            display: "flex",
          }}
        >
          <img src={next.icon} style={{ padding: 8, width: 64, height: 64, background: "rgba(235, 222, 220, 0.60)" }} />
          <div style={{ textAlign: "left" }}>
            <SmallText>{(next.id % 10) + 1} level</SmallText>
            {user.hot.isWood(next.id) && <BoldP>×{formatAmount(next.value, 1)} per hour</BoldP>}
            {user.hot.isStorage(next.id) && <BoldP>Claim every {user.hot.storageCapacityHours(next.id)}h</BoldP>}
            {user.hot.isFireplace(next.id) && <BoldP>+{formatAmount(next.value, 6)} per hour</BoldP>}
          </div>
        </div>

        <Icon style={{ margin: "12px 0", transform: "rotate(-90deg)" }} name="arrow-right" />

        <div style={{ borderRadius: 12, width: "100%", alignItems: "center", gap: 12, overflow: "hidden", border: "1px solid var(--border-low, #C7BAB8)", display: "flex" }}>
          <img src={current.icon} style={{ padding: 8, width: 64, height: 64, background: "rgba(235, 222, 220, 0.60)" }} />
          <div style={{ textAlign: "left" }}>
            <SmallText>{(current.id % 10) + 1} level</SmallText>
            {user.hot.isWood(current.id) && <BoldP>×{formatAmount(current.value, 1)} per hour</BoldP>}
            {user.hot.isStorage(current.id) && <BoldP>Claim every {user.hot.storageCapacityHours(current.id)}h</BoldP>}
            {user.hot.isFireplace(current.id) && <BoldP>+{formatAmount(current.value, 6)} per hour</BoldP>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
        {!next.mission && <img style={{ width: 32, height: 32, marginLeft: -12 }} src={require("../../assets/hot/hot.png")} />}

        <LargeP style={{ fontWeight: "bold" }}>{next.mission ? next.mission_text || next.mission : formatAmount(next.hot_price || 0, 6)}</LargeP>
      </div>

      {next.mission && !user.hot.canUpgrade(id + 1) ? (
        <ActionButton disabled={isChecking} onClick={updateMissions}>
          {isChecking ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "I completed the mission"}
        </ActionButton>
      ) : (
        <ActionButton disabled={!user.hot.canUpgrade(id + 1) || isLoading} onClick={() => upgrade()}>
          Upgrade
        </ActionButton>
      )}

      {isLoading && <ClaimingLoading text="Upgrading..." style={{ position: "absolute", left: 0, right: 0, background: colors.elevation0 }} />}
    </div>
  );
});

const BoostItem = ({ boost }: { boost: any }) => {
  const user = useWallet()!;
  const nextBoost = user.hot.getBooster(boost.id + 1);

  return (
    <div key={boost.id} style={{ display: "flex", gap: 12, alignItems: "center" }} onClick={() => nextBoost && sheets.present({ id: "Boost", element: <BoostPopup id={boost.id} /> })}>
      <img
        src={boost.icon}
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          background: "rgba(243, 235, 234, 0.60)",
          border: "none",
        }}
      />

      <div>
        <BoldP>{boost.title}</BoldP>
        {nextBoost ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, marginLeft: -2 }}>
            {nextBoost?.mission ? <Icon name="mission" /> : <img style={{ width: 24, height: 24 }} src={require("../../assets/hot/hot.png")} />}

            <BoldP>{nextBoost?.mission ? "Mission" : formatAmount(nextBoost?.hot_price || 0, 6)}</BoldP>
            <Text style={{ color: colors.blackSecondary }}> • L{(boost.id % 10) + 1}</Text>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, marginLeft: -2 }}>
            <Icon name="tick-circle" />
            <BoldP>Completed</BoldP>
            <Text style={{ color: colors.blackSecondary }}>• L{(boost.id % 10) + 1}</Text>
          </div>
        )}
      </div>

      {nextBoost != null && <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />}
    </div>
  );
};

const Boosters = () => {
  const user = useWallet()!;
  useNavigateBack();

  useEffect(() => {
    user.hot.fetchMissions();
    window.Telegram.WebApp.setBackgroundColor?.("#f6b380");
    return () => window.Telegram.WebApp.setBackgroundColor?.(colors.elevation1);
  }, []);

  return (
    <Root>
      <BlurBackground />
      <img src={require("../../assets/hot/stars.png")} style={{ position: "fixed", top: 56, width: "100vw" }} />

      <Container style={{ zIndex: 10 }}>
        <div>
          <div style={{ display: "flex", padding: "36px 0", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Text style={{ color: colors.blackSecondary, marginBottom: -16 }}>Your balance</Text>
            <Balance />

            <Button style={{ marginTop: 4 }}>
              <BoldP style={{ color: "#0258F7" }}>How cave works</BoldP>
            </Button>
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", borderRadius: 16, background: "rgba(243, 235, 234, 0.60)", padding: 16, gap: 24 }}>
            <BoostItem boost={user.hot.storageBooster} />
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", borderRadius: 16, background: "rgba(243, 235, 234, 0.60)", padding: 16, gap: 24 }}>
            <BoostItem boost={user.hot.fireplaceBooster} />
            <BoostItem boost={user.hot.woodBoster} />
          </div>
        </div>
      </Container>
    </Root>
  );
};

export default observer(Boosters);
