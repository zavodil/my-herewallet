import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import WarningIcon from "../assets/alarm.svg";
import DividentsIcon from "../assets/dividents.svg";
import StakeIcon from "../assets/stake.svg";
import UnstakeIcon from "../assets/unstake.svg";

import { ActionButton, ActivityIndicator, Tooltip } from "../uikit";
import { H3, H4, SmallText, Text } from "../uikit/typographic";
import { Button, HereButton } from "../uikit/button";
import { colors } from "../uikit/theme";

import { APP_STORE, GOOGLE_PLAY, HERE_STORAGE_DOCS } from "../core/constants";
import { TransactionModel, TransactionType } from "../core/types";
import { useWallet } from "../core/useWallet";
import { Formatter } from "../core/helpers";
import * as S from "./styled";
import { useAnalytics } from "../core/analytics";
import UserAccount from "../core/UserAccount";
import { TipBuyNFT, TipClaim, TipInstallApp } from "./Tips";

const trxIcon = (trx: TransactionModel) => {
  if (trx.type === TransactionType.DIVIDEND_PAYMENT) {
    return <DividentsIcon />;
  }

  if (trx.type === TransactionType.STAKE_UNSTAKE) {
    return trx.to_account_id === "storage.herewallet.near" ? <StakeIcon /> : <UnstakeIcon />;
  }
};

const trxName = (trx: TransactionModel) => {
  if (trx.type === TransactionType.DIVIDEND_PAYMENT) {
    return "Interest paid out";
  }

  if (trx.type === TransactionType.STAKE_UNSTAKE) {
    return trx.to_account_id === "storage.herewallet.near" ? "Stake" : "Unstake";
  }
};

export const DashboardStaking = observer(() => {
  const { user } = useWallet();
  const track = useAnalytics("dashboard");
  const navigate = useNavigate();

  if (user == null) {
    return <Navigate to="/stake" replace />;
  }

  const claimButton = (
    <div style={{ margin: "auto 0" }}>
      <HereButton
        style={{ width: 105 }}
        disabled={!Formatter.round(user.state.accrued, 4)}
        onClick={() => {
          track("claim");
          user
            .claimDividents()
            .then(() => track("claim_success"))
            .catch(() => track("claim_failed"));
        }}
      >
        {user?.isClaiming ? (
          <ActivityIndicator width={6} style={{ transform: "scale(0.3)" }} />
        ) : (
          "Claim"
        )}
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
            <H4>{Formatter.usd(user.state.totalIncome * user.near2usd)}</H4>
          </Flex>

          <Flex style={{ textAlign: "right" }}>
            <Tooltip
              on={["click"]}
              children={<TipBuyNFT user={user} />}
              position={["right center", "bottom left"]}
              open={user.tips.tipNFT}
              lockScroll
              trigger={
                <Text style={{ cursor: "pointer", textDecoration: "underline" }}>
                  APY: {Formatter.round(user.state.apy * 100)}%
                </Text>
              }
            />
            <Text style={{ color: colors.blackSecondary }}>
              {Formatter.round(user.state.totalIncome, 4)} NEAR
            </Text>
          </Flex>
        </Row>

        <Row>
          <Flex>
            <Text>Interest accrued</Text>
            <div style={{ display: "flex", gap: 8 }}>
              <H4>{Formatter.usd(user.state.accrued * user.near2usd)}</H4>{" "}
              <Text style={{ color: colors.blackSecondary, marginTop: 1 }}>
                {Formatter.round(user.state.accrued, 4)} NEAR
              </Text>
            </div>
          </Flex>

          <Tooltip
            on={[]}
            open={user.tips.tipClaim}
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
            open={user.tips.tipInstallApp}
            closeOnDocumentClick={false}
            closeOnEscape={false}
            trigger={
              <Flex>
                <Text>Staked NEAR</Text>
                <H4>{Formatter.usd(user?.state.staked * user?.near2usd)}</H4>
              </Flex>
            }
          />
          <Text style={{ color: colors.blackSecondary }}>
            {Formatter.round(user?.state.staked, 4)} NEAR
          </Text>
        </Row>

        <Row>
          <Flex>
            <Text>Unstaked NEAR</Text>
            <H4>{Formatter.usd(user.state.unstaked * user.near2usd)}</H4>
          </Flex>
          <Text style={{ color: colors.blackSecondary }}>
            {Formatter.round(user.state.unstaked, 4)} NEAR
          </Text>
        </Row>

        {Formatter.round(user.state.unstaked, 4) > 0 && (
          <Badge>
            <WarningIcon />
            <Text style={{ color: "#DB8520" }}>You don’t get staking interest on unstaked near</Text>
          </Badge>
        )}

        {user.transactions.length > 0 && (
          <>
            <H3 style={{ margin: "24px 24px 8px" }}>Transactions</H3>
            {user.transactions.slice(0, 10).map((trx) => (
              <TransactionItem
                key={trx.transaction_hash}
                target="_blank"
                rel="noopener noreferrer"
                href={`https://explorer.near.org/transactions/${trx.transaction_hash}`}
                onClick={() => track("open_trx")}
              >
                <TransactionIcon>{trxIcon(trx)}</TransactionIcon>
                <Flex style={{ gap: 0, flexShrink: 0 }}>
                  <Text style={{ fontWeight: "bolder" }}>{trxName(trx)}</Text>
                  <SmallText>
                    {new Date(trx.timestamp * 1000).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      day: "numeric",
                      month: "short",
                    })}
                  </SmallText>
                </Flex>
                <Flex style={{ gap: 0, flex: 1, alignItems: "flex-end" }}>
                  <Text style={{ color: colors.green }}>
                    +{Formatter.usd(trx.data.amount * trx.data.usd_rate)}
                  </Text>
                  <SmallText>{Formatter.round(trx.data.amount)} NEAR</SmallText>
                </Flex>
              </TransactionItem>
            ))}
            <SmallText style={{ margin: "8px 24px" }}>We only show the last 10 transactions</SmallText>
          </>
        )}
      </S.DashboardScroll>

      <Footer>
        <ActionButton
          onClick={() => {
            track("open_edit");
            navigate("/stake/change");
          }}
        >
          Stake/Unstake
        </ActionButton>
      </Footer>
    </S.FullCardView>
  );
});

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3d3d1;
  border-radius: 12px;
`;

const TransactionItem = styled.a`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  text-decoration: none;
  transition: 0.2s background;
  padding: 8px 24px;

  &:hover {
    background: #e3d3d1;
  }
`;

const Footer = styled.div`
  border-top: 1px solid #d9cdcb;
  padding: 16px 24px 32px;
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
