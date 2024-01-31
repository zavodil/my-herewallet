import React, { useState } from "react";

import { Button, H2, H4 } from "../../uikit";
import { useNavigateBack } from "../../useNavigateBack";
import { accounts, useWallet } from "../../core/Accounts";
import { BoldP, SmallText } from "../../uikit/typographic";
import { truncateAddress } from "../../core/helpers";
import { storage } from "../../core/Storage";
import { notify } from "../../core/toast";

import { Root } from "../styled";
import { ClaimingLoading } from "./modals";

const HotGuard = ({ Comp }: { Comp: any }) => {
  const user = useWallet()!;
  const [isCreating, setCreating] = useState(false);
  useNavigateBack();

  const creds = storage.getAccount(accounts.telegramAccountId!);
  const switchAcc = async () => {
    if (isCreating) return;
    try {
      setCreating(true);
      await accounts.importAccount(creds?.seed!);
      setCreating(false);
    } catch (e: any) {
      setCreating(false);
      notify(e?.toString?.());
    }
  };

  if (isCreating) {
    return <ClaimingLoading time={20} text="Importing an account" />;
  }

  // if (isTgProd()) {
  //   return (
  //     <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
  //       <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
  //       <H2 style={{ marginTop: 16 }}>HOT</H2>
  //       <H4 style={{ marginTop: -4 }}>launches on January 31st.</H4>
  //     </Root>
  //   );
  // }

  if (accounts.telegramAccountId && accounts.telegramAccountId !== user.near.accountId) {
    return (
      <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
        <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
        <H2 style={{ marginTop: 16 }}>HOT</H2>
        <H4 style={{ marginTop: -4 }}>You're already mining 🤨</H4>
        <SmallText>
          Switch from <b>{truncateAddress(user.near.accountId)}</b> to <b>{truncateAddress(accounts.telegramAccountId)}</b>
        </SmallText>

        {creds?.seed != null && (
          <Button style={{ marginTop: 48 }} $id="switchAccount" onClick={() => switchAcc()}>
            <BoldP>Switch account</BoldP>
          </Button>
        )}
      </Root>
    );
  }

  return <Comp />;
};

export default HotGuard;
