import React, { useEffect } from "react";
import { Card, Container, Root, TokenIcon } from "../styled";
import Header from "../Header";
import { BoldP, H0, H2, H3, LargeP, SmallText, Text, TinyText } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import { ActionButton, Button } from "../../uikit";
import Icon from "../../uikit/Icon";
import { sheets } from "../../uikit/Popup";

const boosters = {
  storage: {
    level: 0,
    id: "storage",
    title: "Storage",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    levels: [
      { image: require("../../assets/hot/storage/1.png"), cost: 100 },
      { image: require("../../assets/hot/storage/2.png"), cost: 100 },
      { image: require("../../assets/hot/storage/3.png"), cost: 100 },
      { image: require("../../assets/hot/storage/4.png"), cost: 100 },
      { image: require("../../assets/hot/storage/5.png"), cost: 100 },
    ],
  },

  woods: {
    level: 0,
    id: "wood",
    title: "Wood",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    levels: [
      { image: require("../../assets/hot/wood/1.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/wood/2.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/wood/3.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/wood/4.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/wood/5.png"), mission: "Hold 1 NEAR" },
    ],
  },
  fireplace: {
    level: 0,
    id: "fireplace",
    title: "Fireplace",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    levels: [
      { image: require("../../assets/hot/fire/1.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/fire/2.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/fire/3.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/fire/4.png"), mission: "Hold 1 NEAR" },
      { image: require("../../assets/hot/fire/5.png"), mission: "Hold 1 NEAR" },
    ],
  },
  referrals: {
    level: 0,
    id: "referrals",
    title: "Friends bonus",
    text: "A stronger, higher-level vault is needed to keep the fire alive... As it holds HOT longer, you need collect HOT less often",
    levels: [{ image: require("../../assets/hot/referral.png") }],
  },
};

const BoostPopup = ({ boost }: { boost: any }) => {
  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <img src={boost.levels[boost.level].image} style={{ width: 140, height: 140, borderRadius: 12 }} />
      <H2>{boost.title}</H2>
      <Text style={{ color: colors.blackSecondary }}>{boost.text}</Text>

      <ActionButton style={{ marginTop: 16 }} onClick={() => sheets.dismiss("Boost")}>
        Upgrade
      </ActionButton>
    </div>
  );
};

const FirstClaimHOT = () => {
  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <img src={require("../../assets/hot-icon.png")} style={{ width: 140, height: 140, borderRadius: 12 }} />
      <H2>+ 1000 HOT</H2>
      <Text style={{ color: colors.blackSecondary }}>
        HOT is an onchain token related to the launch of NEAR Wallet in Telegram. It's mined on the blockchain and can
        be trade or transfer via any crypto wallet. More coming after the mint is over!
      </Text>

      <ActionButton style={{ marginTop: 16 }} onClick={() => sheets.dismiss("Boost")}>
        Claim
      </ActionButton>
    </div>
  );
};

const HOT = () => {
  useEffect(() => {
    sheets.present({ id: "Boost", element: <FirstClaimHOT /> });
  }, []);

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

          <div></div>
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
            <H0>1000</H0>
          </div>

          <div
            style={{
              background: colors.orange,
              border: "1px solid var(--Black-Primary)",
              padding: "4px 12px",
              borderRadius: 8,
            }}
          >
            <Text>+1 per hour</Text>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <H3>Storage</H3>
            <Text style={{ color: colors.blackSecondary }}>• ≈5h left</Text>

            <Button style={{ marginLeft: "auto" }}>
              <BoldP style={{ color: "#0258F7" }}>Claim HOT</BoldP>
            </Button>
          </div>

          <div style={{ marginTop: 16, background: "#FFFFFF66", borderRadius: 8, height: 12, width: "10)%" }}>
            <div style={{ background: colors.blackPrimary, borderRadius: 8, height: 12, width: "40%" }} />
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
            {Object.values(boosters).map((boost) => (
              <div
                key={boost.id}
                style={{ display: "flex", gap: 12, alignItems: "center" }}
                onClick={() =>
                  sheets.present({
                    id: "Boost",
                    element: <BoostPopup boost={boost} />,
                  })
                }
              >
                <img
                  src={boost.levels[boost.level].image}
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
                    <img style={{ width: 24, height: 24 }} src={require("../../assets/hot.png")} />
                    <BoldP>100</BoldP>
                    <Text style={{ color: colors.blackSecondary }}> • L{boost.level + 1}</Text>
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

export default HOT;
