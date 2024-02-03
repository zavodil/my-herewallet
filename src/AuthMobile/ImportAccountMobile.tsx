import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { KeyPair } from "near-api-js";

import { notify } from "../core/toast";
import { storage } from "../core/Storage";
import { accounts } from "../core/Accounts";
import { validateMnemonic } from "../core/near-chain/passphrase/bip39";

import { H1, SmallText, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import { ClaimingLoading } from "../Home/HOT/modals";
import { useNavigateBack } from "../useNavigateBack";
import { colors } from "../uikit/theme";
import HereInput from "../uikit/Input";
import { Root } from "./styled";

const ImportAccountMobile = () => {
  useNavigateBack();
  const navigate = useNavigate();
  const [isCreating, setCreating] = useState(false);
  const [value, setValue] = useState(() => "");

  useEffect(() => {
    if (!accounts.telegramAccountId) return setValue("");
    const creds = storage.getAccount(accounts.telegramAccountId);
    setValue(creds?.seed || creds?.privateKey || "");
  }, [accounts.telegramAccountId]);

  const isValid = useMemo(() => {
    try {
      KeyPair.fromString(value);
      return true;
    } catch {
      return validateMnemonic(value);
    }
  }, [value]);

  const importAccount = async () => {
    try {
      if (isCreating) return;
      setCreating(true);

      // Bind nickname to created seedphrase
      const creds = storage.getAccount(accounts.telegramAccountId || "");
      const telegramAccSeed = creds?.seed || creds?.privateKey || "";
      const nickname = telegramAccSeed === value ? creds?.accountId : undefined;

      if (nickname) {
        const key: any = await accounts.wallet.rpc
          .query({
            finality: "optimistic",
            request_type: "view_account",
            account_id: nickname,
          })
          .catch(() => null);

        if (key?.permission === "FullAccess") await accounts.importAccount(value, nickname);
        else await accounts.connectWeb(value, nickname);
      } else {
        await accounts.importAccount(value, nickname);
      }

      setCreating(false);
      navigate("/");
    } catch (e: any) {
      notify(e?.toString?.());
      setCreating(false);
    }
  };

  if (isCreating) {
    return <ClaimingLoading time={20} text="Importing an account" />;
  }

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

        {!isValid && value !== "" && <SmallText style={{ marginTop: 8, fontWeight: "bold", color: colors.red }}>Seedphrase or private key is invalid</SmallText>}
      </div>

      <div style={{ paddingTop: 32, paddingBottom: 24, width: "100%" }}>
        <ActionButton $id="ImportAccount.continue" style={{ width: "100%" }} disabled={!value || isCreating || !isValid} onClick={() => importAccount()}>
          {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
        </ActionButton>
      </div>
    </Root>
  );
};

export default observer(ImportAccountMobile);
