import React, { useEffect, useRef, useState } from "react";
import { HereProviderRequest } from "@here-wallet/core";
import {
  SnapList,
  SnapItem,
  useScroll,
  useDragToScroll,
  useVisibleElements,
} from "react-snaplist-carousel";
import styled from "styled-components";

import ArrowRightIcon from "../../assets/icons/arrow-right.svg";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg";
import { HereImportAccounts } from "../useSignRequest";
import { defaultToken } from "../../core/constants";
import { FtToken } from "../../core/types";
import { colors } from "../../uikit/theme";
import { Button, H2, Text } from "../../uikit";
import { ActionView } from "./Action";
import { HereApi } from "../../core/api";

export const Connector = ({ request }: { request: HereProviderRequest | HereImportAccounts }) => {
  const [tokens, setTokens] = useState<FtToken[]>([defaultToken]);

  const snapList = useRef(null);
  const goToSnapItem = useScroll({ ref: snapList });
  const selected = useVisibleElements({ ref: snapList, debounce: 10 }, (elements) => elements[0] + 1);
  useDragToScroll({ ref: snapList, disabled: false });

  useEffect(() => {
    new HereApi().getTokens().then(setTokens);
  }, []);

  const nextPage = (diff: number) => {
    goToSnapItem(selected + diff - 1, { animationEnabled: true });
  };

  // @ts-ignore
  if (request.type === "import") {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <H2>Import accounts</H2>
        <Text style={{ marginTop: 16, textAlign: "center" }}>
          You are trying to import accounts
          <br />
          from another wallet to HERE Wallet
        </Text>
      </View>
    );
  }

  if (request.type === "sign") {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <H2>Sign message</H2>
        <Text style={{ marginTop: 16, textAlign: "center" }}>
          The app <span style={{ color: colors.pink }}>{request.receiver}</span>
          {"\n"}asks to sign this message for authorization:
        </Text>

        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            color: colors.blackSecondary,
            lineBreak: "anywhere",
          }}
        >
          {request.message}
        </Text>
      </View>
    );
  }

  if (request.type === "call") {
    let actionsCount = request.transactions.reduce((acc, trx) => acc + trx.actions.length, 0);

    return (
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Button
            onClick={() => nextPage(-1)}
            disabled={selected === 1}
            style={{ opacity: selected === 1 ? 0.3 : 1 }}
          >
            <ArrowLeftIcon />
          </Button>
          <Text style={{ marginLeft: 8, marginRight: 8, marginTop: -4 }}>
            {selected}/{actionsCount}
          </Text>
          <Button
            onClick={() => nextPage(1)}
            disabled={selected === actionsCount}
            style={{ opacity: selected === actionsCount ? 0.3 : 1 }}
          >
            <ArrowRightIcon />
          </Button>
        </View>

        <View style={{ flexDirection: "row", flex: "100%", marginTop: 10 }}>
          <SnapList width="300px" ref={snapList} direction="horizontal">
            {request.transactions.flatMap((trx, i) =>
              trx.actions.map((action, j) => (
                <SnapItem key={`${i}_${j}`} width="100%" snapAlign="center">
                  <View style={{ padding: "0 16px" }}>
                    <ActionView
                      receiver={trx.receiverId ?? "Your wallet"}
                      action={action}
                      tokens={tokens}
                    />
                  </View>
                </SnapItem>
              ))
            )}
          </SnapList>
        </View>
      </View>
    );
  }

  return null;
};

const View = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  flex: 1;
`;
