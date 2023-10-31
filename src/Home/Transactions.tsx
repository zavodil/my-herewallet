import React from "react";
import styled from "styled-components";

import { SmallText, Text } from "../uikit/typographic";
import { colors } from "../uikit/theme";
import { H3 } from "../uikit";

import { Card } from "./styled";
import { TransactionModel } from "./types";
import Icon from "../uikit/Icon";

const Transactions = ({ data }: { data: TransactionModel[] }) => {
  return (
    <TransactionsCard>
      <H3 style={{ marginBottom: 12 }}>Transactions</H3>
      {data.map((trx, i) => (
        <TransactionItem
          key={trx.metadata.id + "i"}
          rel="noopener noreferrer"
          href={trx.metadata.link}
          target="_blank"
        >
          <TransactionIcon>
            <Icon name={trx.badge.icon as any} />
          </TransactionIcon>
          <Flex style={{ gap: 0, flexShrink: 0 }}>
            <Text style={{ fontWeight: "bolder" }}>
              {trx.badge.title.length > 20
                ? trx.badge.title.slice(0, 10) + ".." + trx.badge.title.slice(-10)
                : trx.badge.title}
            </Text>
            <SmallText>{trx.badge.sub_title}</SmallText>
          </Flex>
          <Flex style={{ gap: 0, flex: 1, alignItems: "flex-end" }}>
            <Text
              style={{ fontWeight: "bolder", color: trx.badge.is_income ? colors.green : colors.red }}
            >
              {trx.badge.info}
            </Text>
            <SmallText>{trx.badge.sub_info}</SmallText>
          </Flex>
        </TransactionItem>
      ))}

      <SmallText style={{ marginTop: 8 }}>We only show the last 10 transactions</SmallText>
    </TransactionsCard>
  );
};

const TransactionsCard = styled(Card)`
  grid-area: transactions;
  overflow-y: auto;
  height: 100%;
`;

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--Elevation-1);
  border-radius: 12px;
  flex-shrink: 0;
`;

const TransactionItem = styled.a`
  width: calc(100% + 48px);
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: 0.2s background;
  padding: 8px 24px;
  margin-left: -24px;
  gap: 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default Transactions;
