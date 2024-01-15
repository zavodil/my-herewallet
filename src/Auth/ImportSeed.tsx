import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { accounts } from "../core/Accounts";
import { H1, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import HereInput from "../uikit/Input";
import Header from "../Home/Header";
import { Root } from "./styled";

const ImportAccount = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [isCreating, setCreating] = useState(false);

  return (
    <Root>
      <Header />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: 455,
          margin: "auto",
          gap: 56,
          flex: 1,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <H1>
            Log in with passphrase
            <br />
            or private key
          </H1>
          <Text style={{ marginTop: 8 }}>
            Enter the backup passphrase or private key
            <br />
            associated with the account.
          </Text>
        </div>

        <div style={{ position: "relative", width: 455 }}>
          <HereInput
            multiline
            label="Seed or private key"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            style={{ height: 100, width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", width: "100%", gap: 12 }}>
          <ActionButton
            style={{ flex: 1 }}
            disabled={!value || isCreating}
            onClick={() => {
              if (isCreating) return;
              setCreating(true);
              accounts
                .importAccount(value)
                .then(() => navigate("/"))
                .finally(() => setCreating(false));
            }}
          >
            {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
          </ActionButton>
        </div>
      </div>
    </Root>
  );
};

export default observer(ImportAccount);
