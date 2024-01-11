import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import Header from "../Home/Header";
import { accounts, useWallet } from "../core/Accounts";
import { BoldP, H1, H3, LargeP, Text } from "../uikit/typographic";
import { TokenAction } from "../Home/styled";
import { colors } from "../uikit/theme";
import { Button } from "../uikit";

import CreateNickname from "./CreateNickname";
import { Card, Root } from "./styled";

const ImportAccount = () => {
  const navigate = useNavigate();
  const [needActive, setNeedActive] = useState(false);
  const wallet = useWallet();

  if (needActive && wallet) {
    return <CreateNickname onCreate={(n) => wallet.bindNickname(n).then(() => navigate("/"))} />;
  }

  return (
    <Root>
      <Header />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          gap: 56,
          padding: 56,
        }}
      >
        <div style={{ marginTop: "auto" }}>
          <H1 style={{ textAlign: "center" }}>Connect your wallet</H1>
          <div style={{ marginTop: 32, gap: 16, display: "flex" }}>
            <Card
              style={{ width: 256, height: 280, gap: 24, alignItems: "center" }}
              onClick={() => accounts.connectHere().then(() => navigate("/"))}
            >
              <Text style={{ color: colors.blackSecondary }}>Mobile</Text>
              <TokenAction style={{ width: 80, height: 80 }}>
                <img style={{ width: 56, height: 56, objectFit: "contain" }} src={require("../assets/here.svg")} />
              </TokenAction>
              <H3>HERE Wallet App</H3>
            </Card>

            <Card
              style={{ width: 256, height: 280, gap: 24, alignItems: "center" }}
              onClick={() => accounts.connectLedger().then(() => navigate("/"))}
            >
              <Text style={{ color: colors.blackSecondary }}>Hardware</Text>
              <TokenAction style={{ width: 80, height: 80 }}>
                <img style={{ width: 64, height: 64, objectFit: "contain" }} src={require("../assets/ledger.png")} />
              </TokenAction>
              <H3>Ledger</H3>
            </Card>

            <Card
              style={{ width: 256, height: 280, gap: 24, alignItems: "center" }}
              onClick={() => navigate("/auth/import/backup")}
            >
              <Text style={{ color: colors.blackSecondary }}>Backup</Text>
              <TokenAction style={{ width: 80, height: 80 }}>
                <img
                  style={{ width: 56, height: 56, objectFit: "contain" }}
                  src={require("../assets/import-seed.svg")}
                />
              </TokenAction>
              <H3 style={{ textAlign: "center" }}>Passphrase or Private Key</H3>
            </Card>
          </div>
        </div>

        <div>
          <LargeP style={{ textAlign: "center", color: colors.blackSecondary }}>Other options</LargeP>
          <div style={{ display: "flex", marginTop: 24, gap: 20 }}>
            <Card
              style={{ flexDirection: "row", gap: 12, height: 64, padding: "16px 32px" }}
              onClick={() => accounts.connectSelector().then(() => navigate("/"))}
            >
              <img style={{ width: 32, height: 32 }} src={require("../assets/near.svg")} />
              <H3>Wallet selector</H3>
            </Card>

            <Card
              style={{ flexDirection: "row", gap: 12, height: 64, padding: "16px 32px" }}
              onClick={async () => {
                const isAvailable = await accounts.snap.provider.isSnapsAvailable().catch(() => false);
                if (!isAvailable) {
                  window.open("https://metamask.io/download/", "_blank")?.focus();
                  return;
                }

                const isNeed = await accounts.connectSnap();
                if (isNeed) setNeedActive(true);
                else navigate("/");
              }}
            >
              <img style={{ width: 32, height: 32 }} src={require("../assets/metamask.svg")} />
              <H3>Metamask snap</H3>
            </Card>
          </div>
        </div>

        <Button style={{ marginTop: "auto" }} onClick={() => navigate("/auth/create")}>
          <BoldP>
            Don’t have an account? <span style={{ textDecoration: "underline" }}>Create a new one</span>
          </BoldP>
        </Button>
      </div>
    </Root>
  );
};

export default observer(ImportAccount);
