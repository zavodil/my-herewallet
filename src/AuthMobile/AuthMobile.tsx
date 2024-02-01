import React, { useEffect, useState } from "react";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import crypto from "crypto";

import introImage from "../assets/intro.png";
import { accounts } from "../core/Accounts";
import { truncateAddress } from "../core/helpers";
import { BoldP, H1, LargeP, SmallText } from "../uikit/typographic";
import { ActionButton, Button } from "../uikit";
import { IntroImage, Root } from "./styled";
import { colors } from "../uikit/theme";
import { decryptText } from "../core/Storage";
import { UserCred } from "../core/types";

const rpc = new JsonRpcProvider({ url: "https://rpc.mainnet.near.org" });

const Auth = () => {
  const navigate = useNavigate();
  const [refAccount, setRefAccount] = useState<string>();

  useEffect(() => {
    // const list: UserCred[] = [];
    // Object.entries({ ...localStorage }).forEach(([key, value]) => {
    //   try {
    //     const salt = crypto.createHash("sha256").update(key).digest().toString("hex");
    //     list.push(JSON.parse(decryptText(value, "dz_3!R$%2pdf~" + salt)));
    //   } catch {}
    // });

    // list.map(async (cred) => {
    //   const { result } = await rpc.query({
    //     finality: "final",
    //     request_type: "call_function",
    //     args_base64: Buffer.from(JSON.stringify({ account_id: cred.accountId }), "utf8").toString("base64"),
    //     account_id: "game.hot.tg",
    //     method_name: "ft_balance_of",
    //   });

    //   console.log(cred.accountId, JSON.parse(Buffer.from(result).toString("utf8")));
    // });

    const refId = window.Telegram.WebApp?.initDataUnsafe?.start_param;
    if (isNaN(+refId)) return;
    accounts.api
      .request(`/api/v1/user/hot/by_user_id?user_id=${refId}`)
      .then((res) => res.json())
      .then(({ near_account_id }: any) => {
        setRefAccount(near_account_id);
      });
  }, []);

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
