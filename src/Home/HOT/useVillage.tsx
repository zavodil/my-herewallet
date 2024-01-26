import React, { useEffect, useState } from "react";
import { isNumber } from "lodash";

import { ActionButton, ActivityIndicator, H2, Text } from "../../uikit";
import { useWallet } from "../../core/Accounts";
import { sheets } from "../../uikit/Popup";
import { notify } from "../../core/toast";

export const JoinVillage = ({ id }: { id: number }) => {
  const user = useWallet()!;
  const [isLoading, setLoading] = useState(false);
  const [village, setVillage] = useState<any>();

  useEffect(() => {
    user.hot.getVillage(id).then(setVillage);
  }, [id]);

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      {village != null && (
        <div>
          <img src={village.avatar} style={{ objectFit: "cover", width: 120, height: 120, borderRadius: 24 }} />
          <H2>{village.name}</H2>
        </div>
      )}

      <Text style={{ marginTop: 8, marginBottom: 32 }}>Village members can earn +5% HOT. Best villages receive daily USDT giveaways</Text>

      <ActionButton
        disabled={isLoading}
        onClick={async () => {
          try {
            setLoading(true);
            await user.hot.joinVillage(id);
            sheets.dismiss("JoinVillage");
            notify("You have joined the village");
            setLoading(false);
          } catch {
            notify("Join failed");
            setLoading(false);
          }
        }}
      >
        {isLoading ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Join"}
      </ActionButton>
    </div>
  );
};

export const useHOTVillage = () => {
  const user = useWallet();
  useEffect(() => {
    if (!user?.hot) return;
    const id = +window.Telegram.WebApp.initDataUnsafe.start_param;
    if (isNumber(id) && id < 0) {
      user?.hot.updateStatus().then(() => {
        if (user?.hot.state?.village === `${Math.abs(id)}.village.hot-token.near`) return;
        sheets.present({ id: "JoinVillage", element: <JoinVillage id={id} /> });
      });
    }
  }, []);
};
