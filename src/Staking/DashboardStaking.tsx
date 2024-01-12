import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { ActionButton, Tooltip } from "../uikit";
import { H4, Text } from "../uikit/typographic";
import { HereButton } from "../uikit/button";
import { colors } from "../uikit/theme";

import UserAccount from "../core/UserAccount";
import { useWallet } from "../core/Accounts";
import { useAnalytics } from "../core/analytics";
import { Formatter } from "../core/helpers";

import { TipBuyNFT, TipClaim, TipInstallApp } from "./Tips";
import * as S from "./styled";
import Icon from "../uikit/Icon";

export const DashboardStaking = observer(() => {
  const user = useWallet()!;
  const navigate = useNavigate();
  return <DashboardStakingScreen user={user} onStake={() => navigate("/stake/change")} />;
});

export const DashboardStakingScreen = observer(({ user, onStake }: { user: UserAccount; onStake: () => void }) => {
  const track = useAnalytics("dashboard");

  const claimButton = (
    <div style={{ margin: "auto 0" }}>
      <HereButton
        style={{ width: 105 }}
        disabled={!Formatter.round(user.near.hnear.accrued, 4)}
        onClick={() => {
          track("claim");
          user.near.hnear
            .claimDividents()
            .then(() => track("claim_success"))
            .catch(() => track("claim_failed"));
        }}
      >
        Claim
        {/* {user?.isClaiming ? <ActivityIndicator width={6} style={{ transform: "scale(0.3)" }} /> : "Claim"} */}
      </HereButton>
    </div>
  );

  return (
    <S.FullCardView style={{ padding: 0 }}>
      <Flex style={{ justifyContent: "center", height: 56, flexShrink: 0 }}>
        <Text style={{ fontWeight: "bolder" }}>Dashboard</Text>
      </Flex>

      <S.DashboardScroll>
        <Row style={{ borderTop: 0 }}>
          <Flex>
            <Text>Interest paid</Text>
            <H4>{Formatter.usd(user.near.hnear.totalDividends)}</H4>
          </Flex>

          <Flex style={{ textAlign: "right" }}>
            <Tooltip
              on={["click"]}
              children={<TipBuyNFT user={user} />}
              position={["right center", "bottom left"]}
              open={user.near.hnear.tips.tipNFT}
              lockScroll
              trigger={
                <Text style={{ cursor: "pointer", textDecoration: "underline" }}>
                  APY: {Formatter.round(user.near.hnear.apy)}%
                </Text>
              }
            />
            <Text style={{ color: colors.blackSecondary }}>
              {Formatter.round(user.near.hnear.totalDividends, 4)} NEAR
            </Text>
          </Flex>
        </Row>

        <Row>
          <Flex>
            <Text>Interest accrued</Text>
            <div style={{ display: "flex", gap: 8 }}>
              <H4>{Formatter.usd(user.near.hnear.accrued * user.tokens.usd(user.tokens.near))}</H4>
              <Text style={{ color: colors.blackSecondary, marginTop: 1 }}>
                {Formatter.round(user.near.hnear.accrued, 4)} NEAR
              </Text>
            </div>
          </Flex>

          <Tooltip
            on={[]}
            open={user.near.hnear.tips.tipClaim}
            children={<TipClaim user={user} />}
            position={["right center", "top center"]}
            closeOnDocumentClick={false}
            closeOnEscape={false}
            trigger={claimButton}
            offsetX={10}
          />
        </Row>
        <Row>
          <Tooltip
            on={[]}
            children={<TipInstallApp user={user} />}
            position={["left center", "bottom left"]}
            open={user.near.hnear.tips.tipInstallApp}
            closeOnDocumentClick={false}
            closeOnEscape={false}
            trigger={
              <Flex>
                <Text>Staked NEAR</Text>
                <H4>{Formatter.usd(user.tokens.fiat(user.tokens.hnear))}</H4>
              </Flex>
            }
          />
          <Text style={{ color: colors.blackSecondary }}>{Formatter.round(user.tokens.hnear.amountFloat, 4)} NEAR</Text>
        </Row>

        <Row>
          <Flex>
            <Text>Unstaked NEAR</Text>
            <H4>{Formatter.usd(user.tokens.fiat(user.tokens.near))}</H4>
          </Flex>
          <Text style={{ color: colors.blackSecondary }}>{Formatter.round(user.tokens.near.amountFloat, 4)} NEAR</Text>
        </Row>

        {Formatter.round(user.tokens.near.amountFloat, 4) > 0 && (
          <Badge>
            <Icon name="alarm" />
            <Text style={{ color: "#DB8520" }}>You don’t get staking interest on unstaked near</Text>
          </Badge>
        )}
      </S.DashboardScroll>

      <Footer style={{ marginTop: "auto" }}>
        <ActionButton
          onClick={() => {
            track("open_edit");
            onStake();
          }}
        >
          Stake/Unstake
        </ActionButton>
      </Footer>
    </S.FullCardView>
  );
});

const Footer = styled.div`
  border-top: 1px solid #d9cdcb;
  padding: 12px 16px 16px;
  width: 100%;

  @media (max-width: 576px) {
    position: fixed;
    bottom: 0;
    background: #f4ebea;
    padding-bottom: 24px;
  }
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  border-top: 1px solid #d9cdcb;
  padding: 16px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
`;

const Badge = styled.div`
  background: rgba(219, 133, 32, 0.15);
  border: 1px solid #db8520;
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #db8520;
  gap: 8px;
  margin: 0 24px;

  svg {
    flex-shrink: 0;
  }
`;
