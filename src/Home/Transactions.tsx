import React from "react";
import styled from "styled-components";

import { TransactionModel } from "../core/transactions/types";
import { BoldP, SmallText, Text } from "../uikit/typographic";
import { colors } from "../uikit/theme";
import Icon from "../uikit/Icon";
import { Button } from "../uikit";
import { notify } from "../core/toast";

export const Transaction = ({ trx }: { trx: TransactionModel }) => {
  return (
    <TransactionItem key={trx.metadata.id + "i"}>
      <TransactionIcon>
        <Icon name={trx.badge.icon as any} />
      </TransactionIcon>

      <Text style={{ fontWeight: "bolder" }}>
        {trx.badge.title.length > 16 ? trx.badge.title.slice(0, 6) + ".." + trx.badge.title.slice(-6) : trx.badge.title}
      </Text>

      <Flex style={{ gap: 0, flex: 1 }}>
        <Text style={{ fontWeight: "bolder", color: trx.badge.is_income ? colors.green : colors.red }}>
          {trx.badge.info}
        </Text>
        <SmallText>{trx.badge.sub_info}</SmallText>
      </Flex>

      <Text>{trx.badge.sub_title}</Text>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginRight: -4, paddingRight: 8, width: 80 }}>
        {trx.metadata.link && (
          <>
            <BoldP
              style={{ textDecoration: "underline" }}
              rel="noopener noreferrer"
              href={trx.metadata.link}
              target="_blank"
              as="a"
            >
              Link
            </BoldP>
            <Button
              onClick={async (e) => {
                await navigator.clipboard.writeText(trx.metadata.link!);
                notify("Transaction address has beed copied");
              }}
            >
              <Icon name="copy" />
            </Button>
          </>
        )}
      </div>
    </TransactionItem>
  );
};

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

const TransactionItem = styled.div`
  width: calc(100% + 48px);
  display: grid;
  grid-template-columns: 40px 1.4fr 0.8fr 0.8fr 0.2fr;
  align-items: center;
  transition: 0.2s background;
  padding: 8px 24px;
  margin-left: -24px;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
