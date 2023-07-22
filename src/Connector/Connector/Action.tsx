import React, { useState } from "react";
import { format } from "near-api-js/lib/utils";
import { Action } from "@here-wallet/core";
import styled from "styled-components";

import DoneIcon from "../../assets/icons/done.svg";
import { H2, H3, Text, SmallText } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import { FtToken } from "../../Staking/core/types";
import { parseArgs, parseFunctionCall } from "./parseTransactions";
import { defaultToken } from "../../Staking/core/constants";
import { Button } from "../../uikit";

interface Props {
  action: Action;
  receiver: string;
  tokens: FtToken[];
}

export const ActionView = ({ action, receiver, tokens }: Props) => {
  const [isShowArgs, setShowArgs] = useState(false);

  switch (action.type) {
    case "AddKey":
      const { permission } = action.params.accessKey;

      if (permission === "FullAccess") {
        return (
          <View style={{ alignItems: "center" }}>
            <H2 style={{ marginBottom: 8 }}>Add full key</H2>
            <Text style={{ marginTop: 12, textAlign: "center" }}>
              You give this key full access to your account. The third party apText will have{" "}
              <Text style={{ color: colors.red }}>full access to your account and your money.</Text>
            </Text>
          </View>
        );
      }

      const methodNames = permission?.methodNames ?? [];
      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <H2 style={{ marginBottom: 8 }}>Add access key</H2>
          <Text style={{ textAlign: "center", marginBottom: 8 }}>
            <Text style={{ color: colors.pink }}>{permission.receiverId}</Text> will have limited
            permissions
          </Text>

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignSelf: "stretch",
              justifyContent: "flex-start",
            }}
          >
            <DoneIcon style={{ flexShrink: 0, marginRight: 8 }} />
            <Text>View info of your pemitted account</Text>
          </View>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignSelf: "stretch",
            }}
          >
            <DoneIcon style={{ flexShrink: 0, marginRight: 8 }} />
            {methodNames.length > 0 ? (
              <Text>
                Call methods:{" "}
                {methodNames.map((method, i) => (
                  <Text>
                    <Text key={i} style={{ color: colors.pink }}>
                      {method}
                    </Text>
                    {i !== methodNames.length - 1 ? ", " : ""}
                  </Text>
                ))}
              </Text>
            ) : (
              <Text>Can call all not payable methods of this contract</Text>
            )}
          </View>
        </View>
      );

    case "FunctionCall":
      const act = parseFunctionCall(receiver, action, tokens);
      if (act.ftAmount != null && act.ft != null) {
        return (
          <View style={{ alignItems: "center" }}>
            <H2 style={{ marginBottom: 8 }}>
              {act.ftAmount} {act.ft.symbol}
            </H2>

            <View style={styles.row}>
              <Text style={{ marginRight: 8 }}>Contract</Text>
              <Text style={{ ...styles.trim, color: colors.pink } as any}>{receiver}</Text>
            </View>

            <View style={styles.row}>
              <Text>Method</Text>
              <Button onClick={() => setShowArgs((v) => !v)}>
                <Text style={{ color: colors.pink }}>
                  {action.params.methodName} ({isShowArgs ? "Hide" : "Show"} args)
                </Text>
              </Button>
            </View>

            {isShowArgs && (
              <View style={styles.code}>
                <SmallText style={{ color: "#fff", flex: 1 }}>
                  {JSON.stringify(parseArgs(action.params.args), null, 4)}
                </SmallText>
              </View>
            )}

            <View style={styles.row}>
              <Text>Deposit</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text>{act.nearAmount} NEAR</Text>
                <SmallText style={{ color: colors.blackSecondary }}>
                  ${+act.nearAmount * (act.nearToken?.usd_rate ?? 0)}
                </SmallText>
              </View>
            </View>
            <View style={styles.row}>
              <Text>Gas</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text>{act.Tgas} TGas</Text>
              </View>
            </View>
          </View>
        );
      }

      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>Call smart contract</H2>

          <View style={styles.row}>
            <Text>Contract</Text>
            <Text style={{ color: colors.pink }}>{receiver}</Text>
          </View>

          <View style={styles.row}>
            <Text>Method</Text>
            <Button onClick={() => setShowArgs((v) => !v)}>
              <Text style={{ color: colors.pink }}>
                {action.params.methodName} ({isShowArgs ? "Hide" : "Show"} args)
              </Text>
            </Button>
          </View>

          {isShowArgs && (
            <View style={styles.code}>
              <SmallText style={{ color: "#fff", flex: 1 }}>
                {JSON.stringify(parseArgs(action.params.args), null, 4)}
              </SmallText>
            </View>
          )}

          <View style={styles.row}>
            <Text>Deposit</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text>{act.nearAmount} NEAR</Text>
              <SmallText style={{ color: colors.blackSecondary }}>
                ${+act.nearAmount * (act.nearToken?.usd_rate ?? 0)}
              </SmallText>
            </View>
          </View>
          <View style={styles.row}>
            <Text>Gas</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text>{act.Tgas} TGas</Text>
            </View>
          </View>
        </View>
      );

    case "DeleteKey":
      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>Delete access key</H2>
          <Text>TODO: info about key</Text>
        </View>
      );

    case "CreateAccount":
      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>CreateAccount</H2>
        </View>
      );

    case "DeleteAccount":
      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>DeleteAccount</H2>
        </View>
      );

    case "DeployContract":
      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>Deploy Contract</H2>
        </View>
      );

    case "Stake": {
      const stake = +format.formatNearAmount(action.params.stake, 6);
      const nearToken = tokens.find((t) => t.symbol === "NEAR") ?? defaultToken;

      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>Stake</H2>
          <H3>{stake} NEAR</H3>
          <SmallText style={{ color: colors.blackSecondary }}>
            ${(stake * nearToken.usd_rate).toFixed(6)}
          </SmallText>
          <View style={styles.row}>
            <Text>From</Text>
            {nearToken.amount ? (
              <View style={{ alignItems: "flex-end" }}>
                <Text>NEAR Balance</Text>
                <SmallText style={{ color: colors.blackSecondary }}>
                  ${(nearToken.amount * nearToken.usd_rate).toFixed(6)}
                </SmallText>
              </View>
            ) : (
              <Text>Your wallet</Text>
            )}
          </View>
        </View>
      );
    }

    case "Transfer": {
      const deposit = +format.formatNearAmount(action.params.deposit, 6);
      const nearToken = tokens.find((t) => t.symbol === "NEAR") ?? defaultToken;

      return (
        <View style={{ alignItems: "center" }}>
          <H2 style={{ marginBottom: 8 }}>{deposit} NEAR</H2>
          <SmallText style={{ color: colors.blackSecondary }}>
            ${(deposit * nearToken.usd_rate).toFixed(6)}
          </SmallText>

          <View style={styles.row}>
            <Text>From</Text>
            {nearToken.amount ? (
              <View style={{ alignItems: "flex-end" }}>
                <Text>NEAR Balance</Text>
                <SmallText style={{ color: colors.blackSecondary }}>
                  ${(nearToken.amount * nearToken.usd_rate).toFixed(6)}
                </SmallText>
              </View>
            ) : (
              <Text>Your wallet</Text>
            )}
          </View>
          <View style={styles.row}>
            <Text>To</Text>
            <Text style={{ color: colors.pink }}>{receiver}</Text>
          </View>
        </View>
      );
    }

    default:
      return null;
  }
};

const styles = {
  row: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  code: {
    marginTop: 12,
    borderRadius: 8,
    alignSelf: "stretch",
    backgroundColor: colors.blackPrimary,
    overflowY: "scroll",
    height: 142,
    padding: 8,
  },
  trim: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
} as const;

const View = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`;
