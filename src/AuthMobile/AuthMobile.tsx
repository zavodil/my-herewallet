import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";
import { accounts } from "../core/Accounts";
import { ClaimingLoading } from "../Home/HOT/modals";
import { truncateAddress, wait } from "../core/helpers";
import { BoldP, H1, LargeP, SmallText } from "../uikit/typographic";
import { ActionButton, Button } from "../uikit";
import { IntroImage, Root } from "./styled";
import { colors } from "../uikit/theme";
import { notify } from "../core/toast";
import extractAccounts from "./extractAccounts";
import { getStartParam } from "../core/Hot";

const Auth = () => {
  const navigate = useNavigate();
  const [isCreating, setCreating] = useState(false);
  const [refAccount, setRefAccount] = useState<string>();

  const createAccount = async () => {
    const cred = await extractAccounts();
    if (!cred) return;

    try {
      setCreating(true);
      await accounts.importAccount(cred.seed || cred.secretKey, cred.accountId);
      setCreating(false);
      navigate("/");
    } catch (e: any) {
      await wait(1000);
      notify(e?.toString?.(), 5000);
      setCreating(false);
    }
  };

  useEffect(() => {
    createAccount();
    const refId = getStartParam().ref;
    if (!refId) return;

    accounts.api
      .request(`/api/v1/user/hot/by_user_id?user_id=${refId}`)
      .then((res) => res.json())
      .then(({ near_account_id }: any) => {
        setRefAccount(near_account_id);
      });
  }, []);

  if (isCreating) {
    return <ClaimingLoading time={30} text="Creating an account" />;
  }

  return (
    <Root style={{ padding: 24 }}>
      <Button $id="Auth.importAccount" onClick={() => navigate("/auth/import")} style={{ position: "absolute", right: 24, top: 24 }}>
        <BoldP>Log in</BoldP>
      </Button>

      <IntroImage style={{ marginTop: "auto" }}>
        <img src={introImage} />
        <img src={introImage} />
      </IntroImage>

      <H1 style={{ marginTop: 28 }}>NEAR Wallet</H1>
      <LargeP style={{ textAlign: "center" }}>Next generation Telegram wallet. Secure, Fast and over the NEAR Blockchain</LargeP>

      {accounts.telegramAccountId ? (
        <div style={{ textAlign: "center", marginTop: "auto", width: "100%" }}>
          <SmallText style={{ marginBottom: 8 }}>
            You have already created an account <b style={{ color: colors.blackPrimary }}>{truncateAddress(accounts.telegramAccountId || "")}</b>
          </SmallText>

          <ActionButton $id="Auth.createAccount" big onClick={() => navigate("/auth/import")}>
            Import account
          </ActionButton>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: "auto", width: "100%" }}>
          <SmallText style={{ marginBottom: 8, opacity: refAccount ? 1 : 0 }}>
            You're being referred by <b style={{ color: colors.blackPrimary }}>{truncateAddress(refAccount || "")}</b>
          </SmallText>

          <ActionButton $id="Auth.createAccount" big onClick={() => navigate("/auth/create")}>
            Create new account
          </ActionButton>
        </div>
      )}
    </Root>
  );
};

export default observer(Auth);
