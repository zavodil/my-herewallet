import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { useWallet } from "../../core/Accounts";
import { BoosterMission, boosterMissions } from "../../core/configs/hot";
import { BoldP, H2, H3, SmallText, Text } from "../../uikit/typographic";
import { ActionButton, ActivityIndicator, Button } from "../../uikit";
import { useNavigateBack } from "../../useNavigateBack";
import { colors } from "../../uikit/theme";
import { sheets } from "../../uikit/Popup";
import Icon from "../../uikit/Icon";

import BlurBackground from "./effects/BlurBackground";
import { Container, Root } from "../styled";
import { notify } from "../../core/toast";

export const MissionPopup = ({ mission }: { mission: BoosterMission }) => {
  const user = useWallet()!;
  const [isCheck, setCheck] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div style={{ height: "100%", minHeight: 450, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8 }}>
        <img src={user.hot.woodBoster?.icon} style={{ height: 200, objectFit: "cover" }} />

        <H2 style={{ marginTop: 16 }}>{user.hot.woodBoster?.title}</H2>
        <Text style={{ color: colors.blackSecondary }}>{user.hot.woodBoster?.text}</Text>

        <ActionButton $id="Booster.gotIt" style={{ marginTop: 24 }} onClick={() => sheets.dismiss("MissionPopup")}>
          Got it
        </ActionButton>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
      <img src={mission.icon} style={{ width: 80, height: 80 }} />

      <H2>{mission.title}</H2>
      <Text style={{ color: colors.blackSecondary }} dangerouslySetInnerHTML={{ __html: mission.text }} />

      <div style={{ width: "100%" }}>
        <ActionButton stroke $id="InviteFriend.copyReferral" style={{ marginTop: 16 }} onClick={() => mission.onClick?.(user)}>
          {mission.buttonText}
        </ActionButton>

        <ActionButton
          disabled={isCheck}
          $id="InviteFriend.checkStatus"
          style={{ marginTop: 16 }}
          onClick={async () => {
            try {
              setCheck(true);
              await user.hot.upgradeWood(mission.mission);
              setSuccess(true);
              setCheck(false);
            } catch (e: any) {
              notify(e?.message || e?.toString?.());
              setCheck(false);
            }
          }}
        >
          {isCheck ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "I completed the mission"}
        </ActionButton>
      </div>
    </div>
  );
};

const Missions = () => {
  useNavigateBack();
  const user = useWallet()!;

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
        <div style={{ display: "flex", padding: "36px 0", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12, paddingBottom: 0 }}>
          <H3>{boosterMissions.filter((t) => !user.hot.missions[t.mission]).length} missions available</H3>
          <Text style={{ color: colors.blackSecondary, padding: "0 32px" }}>
            Complete mission to upgrade Wood to the next level. Each mission will give you new level. You can complete missions in any order.
          </Text>

          <Button $id="Missions.learnMore" onClick={() => window.Telegram.WebApp.openLink("https://www.herewallet.app/blog/how-to-mine-HOT")}>
            <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>Learn more about missions</SmallText>
          </Button>
        </div>

        <Options>
          {boosterMissions.map((item) => (
            <div
              key={item.mission}
              style={{ display: "flex", gap: 12, alignItems: "center" }}
              onClick={() => {
                if (user.hot.missions[item.mission]) return;
                sheets.present({ id: "MissionPopup", element: <MissionPopup mission={item} /> });
              }}
            >
              <img src={item.icon} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 12 }} />
              <div>
                <BoldP>{item.title}</BoldP>
                {user.hot.missions[item.mission] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <Icon color={colors.green} name="tick" />
                    <BoldP style={{ color: colors.green }}>Completed</BoldP>
                  </div>
                ) : (
                  <SmallText>{item.subtitle}</SmallText>
                )}
              </div>

              {!user.hot.missions[item.mission] && <Icon style={{ marginLeft: "auto", opacity: 0.6 }} name="cursor-right" />}
            </div>
          ))}
        </Options>

        <Options>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src={require("../../assets/hot/hot.png")} style={{ width: 64, height: 64, borderRadius: 12, background: "#fff", padding: 12 }} />
            <div>
              <BoldP>Coming soon...</BoldP>
              <SmallText>Follow the news so you don't miss new missions!</SmallText>
            </div>
          </div>
        </Options>
      </Container>
    </Root>
  );
};

const Options = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: rgba(243, 235, 234, 0.6);
  padding: 16px;
  gap: 24px;
`;

export default observer(Missions);
