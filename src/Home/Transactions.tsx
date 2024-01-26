import React from "react";
import styled from "styled-components";

import { TransactionModel } from "../core/transactions/types";
import { BoldP, SmallText, Text } from "../uikit/typographic";
import { notify } from "../core/toast";
import { Button } from "../uikit";
import Icon from "../uikit/Icon";
import { isTgMobile } from "../Mobile";

export const Transaction = ({ trx }: { trx: TransactionModel }) => {
  return (
    <TransactionItem key={trx.metadata.id + "i"}>
      <TransactionIcon>
        <Icon style={{ width: 24, height: 24 }} name={trx.badge.icon as any} />
      </TransactionIcon>

      <Flex style={{ gap: 0 }}>
        <Text style={{ fontWeight: "bolder", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{trx.badge.title}</Text>
        <SmallText style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
          {new Date(trx.timestamp * 1000).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h24" })}
        </SmallText>
      </Flex>

      <Flex style={{ gap: 0, flex: 2, textAlign: isTgMobile() ? "right" : "left" }}>
        <Text style={{ fontWeight: "bolder", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{trx.badge.info}</Text>
        <SmallText style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{trx.badge.sub_info}</SmallText>
      </Flex>

      {!isTgMobile() && (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginRight: -4, paddingRight: 8 }}>
          {trx.metadata.link && (
            <>
              <BoldP style={{ textDecoration: "underline" }} rel="noopener noreferrer" href={trx.metadata.link} target="_blank" as="a">
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
      )}
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
  grid-template-columns: 40px 1fr 1.5fr ${isTgMobile() ? "" : "68px"};
  align-items: center;
  transition: 0.2s background;
  padding: 8px 24px;
  margin-left: -24px;
  grid-gap: 12px;

  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  > * {
    overflow: hidden;
  }
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
