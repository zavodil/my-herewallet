import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import Header from "../Header";
import { Card, Container, Root, TokenIcon } from "../styled";
import { useWallet } from "../../core/Accounts";

import { BoldP, H0, H2, H3, H4, LargeP, SmallText, Text, TinyText } from "../../uikit/typographic";
import { ActionButton, Button } from "../../uikit";
import { sheets } from "../../uikit/Popup";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";
import Lottie from "lottie-react";
import { notify } from "../../core/toast";

const referrals = {
  level: 0,
  title: "Friends bonus",
  text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
  levels: [{ image: require("../../assets/hot/referral.png") }],
};

const BoostPopup = ({ id }: { id: number }) => {
  const user = useWallet()!;
  const next = user.hot.getBooster(id + 1);
  const [isLoading, setLoading] = useState(false);
  if (!next) return null;

  console.log(next);

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
          <img style={{ width: 32, height: 32, marginLeft: -12 }} src={require("../../assets/hot.png")} />
        )}

        <LargeP style={{ fontWeight: "bold" }}>{next.mission || next.hot_price}</LargeP>
      </div>

      <ActionButton
        style={{ marginTop: 16 }}
        disabled={!user.hot.canUpgrade(id + 1) || isLoading}
        onClick={() => upgrade()}
      >
        Upgrade
      </ActionButton>

      {isLoading && (
        <ClaimingLoading
          text="Upgrading..."
          style={{ position: "absolute", left: 0, right: 0, background: colors.elevation0 }}
        />
      )}
    </div>
  );
};

const FirstClaimHOT = () => {
  const user = useWallet()!;
  const [isLoading, setLoading] = useState(false);
  const referral = new URLSearchParams(location.search).get("referral");

  const register = async () => {
    try {
      setLoading(true);
      sheets.blocked("Boost", true);
      await user.hot.register(referral || "");
      sheets.dismiss("Boost");
      setLoading(false);
    } catch (e) {
      console.log(e);
      sheets.blocked("Boost", false);
      notify("Claim failed");
      setLoading(false);
    }
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
      <img src={require("../../assets/hot-icon.png")} style={{ width: 140, height: 140, borderRadius: 12 }} />
      <H2>+ 1000 HOT</H2>
      <Text style={{ color: colors.blackSecondary }}>
        HOT is an onchain token related to the launch of NEAR Wallet in Telegram. It's mined on the blockchain and can
        be trade or transfer via any crypto wallet. More coming after the mint is over!
      </Text>
      {referral && <BoldP>Your referral: {referral}</BoldP>}
      <ActionButton disabled={isLoading} style={{ marginTop: 16 }} onClick={() => register()}>
        Claim
      </ActionButton>

      {isLoading && (
        <ClaimingLoading
          text="Claiming..."
          style={{ position: "absolute", left: 0, right: 0, background: colors.elevation0 }}
        />
      )}
    </div>
  );
};

const ClaimingLoading = ({ style, text }: { style?: any; text: string }) => {
  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        display: "flex",
        height: "100%",
        ...(style || {}),
      }}
    >
      <Lottie
        animationData={require("../../assets/loading.json")}
        style={{ width: 256, height: 256, marginTop: -56 }}
        width={48}
        height={48}
        loop={true}
      />
      <H4>{text}</H4>
    </div>
  );
};

const formatHours = (hh: number) => {
  const mm = `${Math.round((hh * 60) % 60)}m`;
  return Math.floor(hh) ? `${Math.floor(hh)}h ${mm}` : mm;
};

const HOT = () => {
  const user = useWallet()!;
  useEffect(() => {
    if (user.hot.balance !== 0) return;
    sheets.present({ id: "Boost", element: <FirstClaimHOT />, blocked: true });
  }, [user.hot.balance]);

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
      <Header />

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

      <Container style={{ zIndex: 10 }}>
        <Card style={{ padding: 12, alignItems: "center", flexDirection: "row", gap: 8 }}>
          <TokenIcon src={require("../../assets/hot-icon.png")} />
          <div>
            <TinyText>Minted</TinyText>
            <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>1,1M / 10,000M</SmallText>
          </div>
        </Card>

        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 80,
            marginBottom: 60,
          }}
        >
          <LargeP style={{ color: colors.blackSecondary }}>Your balance</LargeP>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              style={{ width: 60, height: 60, marginTop: -8, marginLeft: -16 }}
              src={require("../../assets/hot.png")}
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
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <H3>Storage</H3>
            <Text style={{ color: colors.blackSecondary }}>• ≈{formatHours(+user.hot.remainingMiningHours)} left</Text>

            <Button disabled={user.hot.miningProgress !== 1} onClick={() => claim()} style={{ marginLeft: "auto" }}>
              <BoldP style={{ color: "#0258F7" }}>Claim HOT</BoldP>
            </Button>
          </div>

          <div style={{ marginTop: 16, background: "#FFFFFF66", borderRadius: 8, height: 12, width: "100%" }}>
            <div
              style={{
                width: `${user.hot.miningProgress * 100}%`,
                background: colors.blackPrimary,
                borderRadius: 8,
                height: 12,
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <H3>Boosters</H3>
            <Button>
              <BoldP style={{ color: "#0258F7" }}>How boost works</BoldP>
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
            {Object.values(user.hot.currentBoosters).map((boost) => (
              <div
                key={boost.id}
                style={{ display: "flex", gap: 12, alignItems: "center" }}
                onClick={() =>
                  user.hot.getBooster(boost.id + 1) &&
                  sheets.present({ id: "Boost", element: <BoostPopup id={boost.id} /> })
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
                      <img style={{ width: 24, height: 24 }} src={require("../../assets/hot.png")} />
                    ) : (
                      <Icon name="mission" />
                    )}

                    <BoldP>{user.hot.getBooster(boost.id + 1)?.hot_price || "Mission"}</BoldP>
                    <Text style={{ color: colors.blackSecondary }}> • L{(boost.id % 10) + 1}</Text>
                  </div>
                </div>

                <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Root>
  );
};

export default observer(HOT);
