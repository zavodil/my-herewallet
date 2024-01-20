import React from "react";
import { useState } from "react";
import { useWallet } from "../../core/Accounts";
import { sheets } from "../../uikit/Popup";
import { ActionButton, H2, H4, Text } from "../../uikit";
import Lottie from "lottie-react";
import { notify } from "../../core/toast";
import { colors } from "../../uikit/theme";
import { BoldP } from "../../uikit/typographic";

export const FirstClaimHOT = () => {
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

export const ClaimingLoading = ({ style, text }: { style?: any; text: string }) => {
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
