import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { useState } from "react";

import { useWallet } from "../../core/Accounts";
import { sheets } from "../../uikit/Popup";
import { notify } from "../../core/toast";
import { colors } from "../../uikit/theme";
import { ActionButton, H2, H4, Text } from "../../uikit";
import { SmallText } from "../../uikit/typographic";

const tips = [
  "You get a 20% HOT cashback from all your referrals income",
  "HOT is minted on the NEAR Protocol blockchain. Same as USDT or wBTC",
  "All account data is stored locally and encrypted. Save the recovery key to log in on another device",
  "You can not only mine HOT here, but also store and transfer other tokens and NFTs",
  "Keep up with HOT news on Telegram channel. Big announcements are coming soon!",
  "Join the village to earn and share awards",
  "Create your own village, grow it and get awards",
  "Transfer HOT to your friends by telegram username",
  "Not only admins but regular chat members can create a village",
  "A black dragon could be hiding somewhere in the fire",
  "The supply of HOT is limited, once it is all distributed mining will stop",
  "Soon you'll be able to turn your game stuff into the NFT",
];

export const InviteFriend = () => {
  const user = useWallet()!;
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
      <img src={require("../../assets/hot/band.png")} style={{ width: 140, height: 140 }} />
      <H2>Friendship bonus</H2>
      <Text style={{ color: colors.blackSecondary }}>
        Friends amplify your power! Earn <b>20% HOT</b> from all your friends' income - no limits, no boundaries. Let's go wild!
      </Text>
      <ActionButton
        $id="InviteFriend.copyReferral"
        style={{ marginTop: 16 }}
        onClick={() => {
          navigator.clipboard.writeText(user.hot.referralLink);
          notify("Referral link has been copied");
        }}
      >
        Copy referral link
      </ActionButton>
    </div>
  );
};

export const FirstClaimHOT = () => {
  const user = useWallet()!;
  const [isLoading, setLoading] = useState(false);

  const register = async () => {
    if (isLoading) return;
    try {
      setLoading(true);
      await user.hot.register();
      sheets.dismiss("Register");
      setLoading(false);
    } catch (e: any) {
      console.log(e);
      notify(e?.toString?.());
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
      <img src={require("../../assets/hot/hot-icon.png")} style={{ width: 140, height: 140, borderRadius: 12 }} />
      <H2>+0.01 HOT</H2>
      <Text style={{ color: colors.blackSecondary }}>HOT is the centerpiece of the new ecosystem. It is distributed to early adopters and mined passively.</Text>
      <ActionButton $id="HotRegister.register" disabled={isLoading} style={{ marginTop: 16 }} onClick={() => register()}>
        Claim
      </ActionButton>

      {isLoading && <ClaimingLoading time={15} text="Claiming" style={{ position: "absolute", left: 0, right: 0, background: colors.elevation0 }} />}
    </div>
  );
};

export const ClaimingLoading = ({ style, text, time = 10 }: { style?: any; text: string; time?: number }) => {
  const [tip, setTip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [startTime] = useState(() => Date.now());
  const ref = useRef<any>();

  useEffect(() => {
    ref.current?.setSpeed(0.5);
    const timer2 = setInterval(() => setCurrentTime(Date.now()), 100);
    const timer = setInterval(() => setTip(tips[Math.floor(tips.length - 1)]), 5000);
    return () => {
      clearInterval(timer);
      clearInterval(timer2);
    };
  });

  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        display: "flex",
        height: "100%",
        padding: 24,
        ...(style || {}),
      }}
    >
      {/* <div style={{ marginTop: "auto", textAlign: "center" }}>
        <Lottie animationData={require("../../assets/loading.json")} style={{ width: 256, height: 256, marginTop: -56 }} width={48} height={48} loop={true} />
        <H4 style={{ marginTop: -32 }}>{text}</H4>
      </div> */}

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          textAlign: "center",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          width: 400,
          height: 400,
        }}
      >
        <Lottie lottieRef={ref} animationData={require("../../assets/hot/ring-loading.json")} style={{ width: 400, height: 400, position: "absolute" }} loop={true} />
        <Lottie animationData={require("../../assets/hot/ring-sparks.json")} style={{ opacity: 0.5, marginTop: -40, width: 1200, height: 1200, position: "absolute" }} loop={true} />

        <H4 style={{ marginLeft: 16, fontFamily: "SF Mono" }}>
          {Math.floor(((currentTime - startTime) / 1000 / time) * 100)}
          <span>%</span>
        </H4>
        <SmallText style={{ marginLeft: 16 }}>{text}</SmallText>
      </div>

      <SmallText style={{ marginTop: "auto", textAlign: "center", width: 280, lineHeight: "18px", fontWeight: "bold" }}>
        <b style={{ color: colors.blackPrimary }}>Pro Tip:</b> {tip}
      </SmallText>
    </div>
  );
};
