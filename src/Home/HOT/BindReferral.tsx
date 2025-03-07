import React, { useEffect, useState } from "react";

import { ActionButton, ActivityIndicator, H2, Text } from "../../uikit";
import { colors } from "../../uikit/theme";
import { sheets } from "../../uikit/Popup";

import { notify } from "../../core/toast";
import { wait } from "../../core/helpers";
import { storage } from "../../core/Storage";
import { getStartParam } from "../../core/Hot";
import { accounts, useWallet } from "../../core/Accounts";
import { isTgMobile } from "../../env";

export const useRecoveryInviter = () => {
  const user = useWallet()!;

  useEffect(() => {
    if (!isTgMobile()) return;
    if (!user.hot?.balance) return;

    const creds = storage.getAccount(user.near.accountId);
    const inviter = creds?.referalId || getStartParam().ref;

    if (user.hot.state?.inviter != null) return;
    if (inviter == null) return;

    accounts.api
      .request(`/api/v1/user/hot/by_user_id?user_id=${inviter}`)
      .then((res) => res.json())
      .then(({ near_account_id }: any) => {
        if (user.near.accountId === near_account_id) return;
        sheets.present({
          element: <BindReferral refAccount={near_account_id} inviter={inviter} />,
          id: "BindReferral",
        });
      });
  }, [user.hot?.balance > 0]);

  return null;
};

export const BindReferral = ({ inviter, refAccount }: { inviter: string; refAccount: string }) => {
  const [isLoading, setLoading] = useState(false);
  const user = useWallet()!;

  const bindInviter = async () => {
    try {
      if (isLoading) return;
      setLoading(true);

      await user.api.request(`/api/v1/user/hot/recover_inviter`, {
        body: JSON.stringify({ inviter_id: inviter }),
        method: "POST",
      });

      let startTime = Date.now();
      const checkStatus = async () => {
        if (Date.now() - startTime > 30_000) throw Error("The server is overloaded, please try later");
        await wait(2000);
        await user.hot.updateStatus();
        if (user.hot.state?.inviter == null) await checkStatus();
      };

      await checkStatus();
      sheets.dismiss("BindReferral");
      notify("Inviter has been linked");
      setLoading(false);
    } catch (e: any) {
      notify(e?.toString?.());
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
      <img src={require("../../assets/hot/band.png")} style={{ width: 140, height: 140 }} />

      <div>
        <H2>Bind Inviter</H2>
        <Text style={{ color: colors.blackSecondary }}>
          You were invited by <b>{refAccount}</b>
        </Text>
      </div>

      <ActionButton $id="BindReferral.bind" style={{ marginTop: 16 }} onClick={() => bindInviter()} disabled={isLoading}>
        {isLoading ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Bind"}
      </ActionButton>
    </div>
  );
};
