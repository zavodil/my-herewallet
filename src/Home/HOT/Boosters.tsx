import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { notify } from "../../core/toast";
import { useWallet } from "../../core/Accounts";
import { ActionButton, Button } from "../../uikit";
import { BoldP, H1, H2, LargeP, Text } from "../../uikit/typographic";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";

import { Container, Root } from "../styled";
import { ClaimingLoading } from "./modals";

const BoostPopup = observer(({ id }: { id: number }) => {
  const user = useWallet()!;
  const next = user.hot.getBooster(id + 1);
  const [isLoading, setLoading] = useState(false);
  const [isChecking, setChecking] = useState(false);
  if (!next) return null;

  const upgrade = async () => {
    try {
      setLoading(true);
      sheets.blocked("Boost", true);
      await user.hot.upgradeBooster(id + 1);
      sheets.dismiss("Boost");
      setLoading(false);
    } catch (e) {
      console.log(e);
      sheets.blocked("Boost", false);
      notify("Upgrade failed");
      setLoading(false);
    }
  };

  const updateMissions = async () => {
    setChecking(true);
    await user.hot.fetchMissions().catch(() => {});
    setChecking(false);
  };

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 24,
      }}
    >
      <img src={next.icon} style={{ width: 140, height: 140, borderRadius: 12 }} />

      <H2>{next.title}</H2>
      <Text style={{ color: colors.blackSecondary }}>{next.text}</Text>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
        {!next.mission && (
          <img style={{ width: 32, height: 32, marginLeft: -12 }} src={require("../../assets/hot/hot.png")} />
        )}

        <LargeP style={{ fontWeight: "bold" }}>{next.mission || next.hot_price}</LargeP>
      </div>

      {next.mission && !user.hot.canUpgrade(id + 1) ? (
        <ActionButton disabled={isChecking} style={{ marginTop: 16 }} onClick={updateMissions}>
          Check mission
        </ActionButton>
      ) : (
        <ActionButton
          style={{ marginTop: 16 }}
          disabled={!user.hot.canUpgrade(id + 1) || isLoading}
          onClick={() => upgrade()}
        >
          Upgrade
        </ActionButton>
      )}

      {isLoading && (
        <ClaimingLoading
          text="Upgrading..."
          style={{ position: "absolute", left: 0, right: 0, background: colors.elevation0 }}
        />
      )}
    </div>
  );
});

const BoostItem = ({ boost }: { boost: any }) => {
  const user = useWallet()!;

  return (
    <div
      key={boost.id}
      style={{ display: "flex", gap: 12, alignItems: "center" }}
      onClick={() =>
        user.hot.getBooster(boost.id + 1) && sheets.present({ id: "Boost", element: <BoostPopup id={boost.id} /> })
      }
    >
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
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, marginLeft: -4 }}>
          {user.hot.getBooster(boost.id + 1)?.hot_price ? (
            <img style={{ width: 24, height: 24 }} src={require("../../assets/hot/hot.png")} />
          ) : (
            <Icon name="mission" />
          )}

          <BoldP>{user.hot.getBooster(boost.id + 1)?.hot_price || "Mission"}</BoldP>
          <Text style={{ color: colors.blackSecondary }}> • L{(boost.id % 10) + 1}</Text>
        </div>
      </div>

      <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
    </div>
  );
};

const Boosters = () => {
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

        <BoldP>My cave</BoldP>
      </div>

      <Container style={{ zIndex: 10 }}>
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "36px 0",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.blackSecondary }}>Your balance</Text>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                style={{ width: 40, height: 40, marginTop: -8, marginLeft: -16 }}
                src={require("../../assets/hot/hot.png")}
              />
              <H1>{Math.max(0, user.hot.balance)}</H1>
            </div>

            <Button style={{ marginTop: 4 }}>
              <BoldP style={{ color: "#0258F7" }}>How cave works</BoldP>
            </Button>
          </div>

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
          >
            <BoostItem boost={user.hot.storageBooster} />
          </div>

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
          >
            <BoostItem boost={user.hot.fireplaceBooster} />
            <BoostItem boost={user.hot.woodBoster} />
          </div>
        </div>
      </Container>
    </Root>
  );
};

export default observer(Boosters);
