import React from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { useWallet } from "../../core/Accounts";
import { BoldP, H4, TinyText } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";

const Widgets = () => {
  const navigate = useNavigate();
  const account = useWallet()!;

  return (
    <div style={{ display: "flex", width: "100%", gap: 16 }}>
      <div
        onClick={() => navigate("/hot")}
        style={{
          flex: 1.3,
          height: 168,
          borderRadius: 20,
          background: "#101112",
          overflow: "hidden",
          position: "relative",
          border: "1px solid var(--Stroke)",
          backgroundImage: `url(${require("../../assets/hot/hot-banner-bg.png")})`,
          backgroundSize: "cover",
          cursor: "pointer",
        }}
      >
        <Lottie
          animationData={require("../../assets/hot/fire.json")}
          style={{ width: "100%", position: "absolute", bottom: -8, pointerEvents: "none" }}
          loop
        />
        <div style={{ background: colors.elevation0, borderRadius: 16, padding: 16, position: "relative" }}>
          <div style={{ width: "100%" }}>
            <H4 style={{ lineHeight: "1em" }} className="fitted">
              HOT Balance
            </H4>
            <br />
            <BoldP style={{ lineHeight: "1em", fontFamily: "SF Mono" }} className="fitted">
              {account.hot.balance.toFixed(6)}
            </BoldP>
          </div>
        </div>
      </div>

      <div
        onClick={() => navigate("/hot")}
        style={{
          flex: 1,
          height: 168,
          borderRadius: 20,
          padding: 16,
          background: colors.elevation0,
          overflow: "hidden",
          position: "relative",
          border: "1px solid var(--Stroke)",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          gap: 10,
        }}
      >
        <H4>Storage</H4>

        <div style={{ display: "flex", gap: 8, flex: 1 }}>
          <div
            style={{
              borderRadius: 4,
              backgroundColor: "#D9CDCB",
              width: 32,
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                borderRadius: 4,
                width: "100%",
                height: `calc(${account.hot.miningProgress} * 100%)`,
                background: "linear-gradient(0deg, #FBC56A 0%, #FE910F 100%)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {account.hot.miningProgress === 1 ? (
              <div style={{ display: "flex", gap: 4 }}>
                <Icon fill={colors.green} name="tick-circle" />
                <BoldP style={{ color: colors.green }}>Full</BoldP>
              </div>
            ) : (
              <BoldP style={{ color: colors.blackSecondary }}>Mining</BoldP>
            )}

            <div style={{ marginTop: "auto" }}>
              <TinyText>Collected</TinyText>
              <BoldP style={{ lineHeight: "1em", fontFamily: "SF Mono" }} className="fitted">
                {account.hot.earned.toFixed(6)}
              </BoldP>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(Widgets);
