import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";

import { notify } from "../core/toast";
import { accounts } from "../core/Accounts";
import { truncateAddress } from "../core/helpers";
import { generateMnemonic } from "../core/near-chain/passphrase/bip39";
import { BoldP, H1, LargeP, SmallText } from "../uikit/typographic";
import { ActionButton, Button } from "../uikit";
import { ClaimingLoading } from "../Home/HOT/modals";
import { IntroImage, Root } from "./styled";
import { colors } from "../uikit/theme";

const Auth = () => {
  const navigate = useNavigate();
  const [isCreating, setCreating] = useState(false);
  const [refAccount, setRefAccount] = useState<string>();

  useEffect(() => {
    const refId = window.Telegram.WebApp?.initDataUnsafe?.start_param;
    if (isNaN(+refId)) return;
    accounts.api
      .request(`/api/v1/user/hot/by_user_id?user_id=${refId}`)
      .then((res) => res.json())
      .then(({ near_account_id }: any) => {
        setRefAccount(near_account_id);
      });
  }, []);

  const createAccount = async () => {
    if (isCreating) return;
    setCreating(true);
    const user = window.Telegram.WebApp?.initDataUnsafe?.user;
    const nickname = (user?.username?.toLowerCase() || `i${user.id.toLowerCase()}`) + ".tg";
    const seed = generateMnemonic();
    try {
      setCreating(true);
      await accounts.connectWeb(seed, nickname);
      setCreating(false);
      navigate("/");
    } catch (e: any) {
      notify(e?.toString?.(), 5000);
      setCreating(false);
    }
  };

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

      <H1 style={{ marginTop: 56 }}>NEAR Wallet</H1>
      <LargeP style={{ marginTop: 24, textAlign: "center" }}>Secure telegram wallet for NEAR Protocol</LargeP>

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

          <ActionButton $id="Auth.createAccount" big onClick={() => createAccount()}>
            Create new account
          </ActionButton>
        </div>
      )}
    </Root>
  );
};

export default observer(Auth);
