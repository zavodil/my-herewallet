import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";

import { H0 } from "../../uikit";
import { useWallet } from "../../core/Accounts";
import fitty from "./effects/fittext";

const Balance = () => {
  const user = useWallet()!;
  const [left, right] = user.hot.balance.toFixed(6).split(".");

  useEffect(() => {
    // @ts-ignore
    const fits = fitty(".balance", { maxSize: 48 });
    return () => {
      fits.forEach((w: any) => w.unsubscribe());
    };
  });

  return (
    <div style={{ display: "flex", width: "80%", alignItems: "center", marginRight: -16, justifyContent: "center" }}>
      <img style={{ width: 50, flexShrink: 0, maxWidth: "60px", objectFit: "contain", marginTop: -6, marginLeft: -32 }} src={require("../../assets/hot/hot.png")} />
      <H0 style={{ fontFamily: "'SF Mono', sans-serif", fontWeight: "900" }} className="balance">
        {left}
        <span style={{ fontFamily: "CabinetGrotesk", fontWeight: "900" }}>.</span>
        {right}
      </H0>
    </div>
  );
};

export default observer(Balance);
