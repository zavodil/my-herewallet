import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { accounts } from "../core/Accounts";
import { H1, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import { ClaimingLoading } from "../Home/HOT/modals";
import { useNavigateBack } from "../useNavigateBack";
import { sheets } from "../uikit/Popup";
import HereInput from "../uikit/Input";
import { Root } from "./styled";

const ImportAccountMobile = () => {
  useNavigateBack();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [isCreating, setCreating] = useState(false);

  return (
    <Root style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
      <H1>
        Recover using
        <br />
        Seed Phrase
      </H1>
      <Text style={{ marginTop: 8, marginBottom: 22 }}>Enter the backup passphrase associated with the account.</Text>

      <div style={{ width: "100%" }}>
        <HereInput
          multiline
          label="Seed or private key"
          value={value}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
          style={{ height: 100, width: "100%" }}
          autoFocus
        />
      </div>

      <div style={{ paddingTop: 32, paddingBottom: 24, width: "100%" }}>
        <ActionButton
          style={{ width: "100%" }}
          disabled={!value || isCreating}
          onClick={() => {
            if (isCreating) return;
            setCreating(true);
            sheets.present({ id: "Loading", fullscreen: true, element: <ClaimingLoading text="Importing..." /> });
            accounts
              .importAccount(value)
              .then(() => navigate("/"))
              .finally(() => {
                sheets.dismiss("Loading");
                setCreating(false);
              });
          }}
        >
          {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
        </ActionButton>
      </div>
    </Root>
  );
};

export default observer(ImportAccountMobile);
