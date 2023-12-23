import React from "react";
import { Container } from "./styled";
import Header from "../Home/Header";
import { Card, Root } from "../Home/styled";
import { ActionButton, Button, H0, H2, H3, Text } from "../uikit";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formatter } from "../core/helpers";
import { useWallet } from "../core/Accounts";
import { Chain } from "../core/token/types";
import { colors } from "../uikit/theme";
import { BoldP } from "../uikit/typographic";

const TransferSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useWallet()!;

  const token = user.tokens.token(Chain.NEAR, params.get("token")!);
  if (token == null) return null;

  return (
    <Root>
      <Header />

      <Container style={{ paddingTop: 72, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card style={{ flexDirection: "row", maxWidth: 700, width: "100%", padding: "64px 48px", gap: 48 }}>
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
              <div style={{ display: "flex", gap: 12, marginRight: -16 }}>
                <H0>{params.get("amount")}</H0>
                <H2 style={{ marginTop: 28 }}>{token.symbol}</H2>
              </div>

              <H3 style={{ color: colors.blackSecondary }}>
                {Formatter.usd(user.tokens.usd(token) * +params.get("amount")!)}
              </H3>
            </div>

            <Text style={{ textAlign: "center" }}>
              You have successfully <br />
              transfered money to {params.get("receiver")}
            </Text>

            <Button
              rel="noopener noreferrer"
              href={`https://nearblocks.io/txns/${params.get("tx")}`}
              target="_blank"
              as="a"
            >
              <BoldP>Transaction link</BoldP>
            </Button>
          </div>
        </Card>

        <ActionButton style={{ marginTop: 32, width: 386 }} onClick={() => navigate("/", { replace: true })} big>
          Back to home page
        </ActionButton>
      </Container>
    </Root>
  );
};

export default TransferSuccess;
