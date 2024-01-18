import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { accounts } from "../core/Accounts";
import { H1, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator, Button } from "../uikit";
import HereInput from "../uikit/Input";
import { Root } from "./styled";
import Icon from "../uikit/Icon";

const ImportAccountMobile = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [isCreating, setCreating] = useState(false);

  return (
    <Root>
      <Button style={{ position: "absolute", left: 16, top: 16 }} onClick={() => navigate("/", { replace: true })}>
        <Icon name="arrow-left" />
      </Button>

      <div style={{ flex: 1, width: "100%", marginTop: 42 }}>
        <H1>
          Recover using
          <br />
          Seed Phrase
        </H1>
        <Text style={{ marginTop: 8, marginBottom: 22 }}>Enter the backup passphrase associated with the account.</Text>

        <HereInput
          multiline
          label="Seed or private key"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          style={{ height: 100, width: "100%" }}
        />
      </div>

      <div
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", gap: 16, padding: "24px 16px" }}
      >
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
    </Root>
  );
};

export default observer(ImportAccountMobile);
