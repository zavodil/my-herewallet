import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { isTgMobile } from "../env";
import Header from "../Home/Header";
import { Root } from "../Home/styled";
import fittext from "../Home/HOT/effects/fittext";

import { Formatter } from "../core/helpers";
import { useWallet } from "../core/Accounts";
import { Chain } from "../core/token/types";

import { colors } from "../uikit/theme";
import { BoldP } from "../uikit/typographic";
import { useNavigateBack } from "../useNavigateBack";
import { ActionButton, Button, H0, H2, H3, Text } from "../uikit";
import { CardSuccess, ContainerSuccess } from "./styled";

const TransferSuccess = () => {
  useNavigateBack();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useWallet()!;

  useEffect(() => {
    // @ts-ignore
    const [fit] = fittext("#balance", { maxSize: 56 });
    return () => fit.unsubscribe();
  }, []);

  const token = user.tokens.token(Chain.NEAR, params.get("token")!);
  if (token == null) return null;

  return (
    <Root>
      {!isTgMobile() && <Header />}

      <ContainerSuccess>
        <CardSuccess>
          <img style={{ width: 200, height: 290, objectFit: "cover" }} src={require("../assets/rock.png")} />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  width: 300,
                  textAlign: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <H0 id="balance">
                  {params.get("amount")}{" "}
                  <H2 as="span" style={{ fontSize: "0.5em" }}>
                    {token.symbol}
                  </H2>
                </H0>
              </div>

              <H3 style={{ color: colors.blackSecondary, marginTop: -8 }}>{Formatter.usd(user.tokens.usd(token) * +params.get("amount")!)}</H3>
            </div>

            <Text style={{ textAlign: "center", marginTop: 12 }}>
              You have successfully <br />
              transfered money to {params.get("receiver")}
            </Text>

            <Button $id="TransferSuccess.openExplorer" rel="noopener noreferrer" href={`https://nearblocks.io/txns/${params.get("tx")}`} target="_blank" as="a">
              <BoldP>Transaction link</BoldP>
            </Button>
          </div>
        </CardSuccess>

        <ActionButton $id="TransferSuccess.back" style={{ marginTop: 32, width: "100%", maxWidth: 386 }} onClick={() => navigate("/", { replace: true })} big>
          Back to home page
        </ActionButton>
      </ContainerSuccess>
    </Root>
  );
};

export default TransferSuccess;
