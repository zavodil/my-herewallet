import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { H0 } from "../../uikit";
import fitty from "./effects/fittext";
import { uniqueId } from "lodash";

const Balance = ({ value, size = 48 }: { value: number; size?: number }) => {
  const [id] = useState(() => uniqueId());
  const [left, right] = value.toFixed(6).split(".");

  useEffect(() => {
    // @ts-ignore
    const fits = fitty(`.balance-${id}`, { maxSize: size });
    return () => {
      fits.forEach((w: any) => w.unsubscribe());
    };
  }, []);

  return (
    <div style={{ display: "flex", width: "80%", alignItems: "center", marginRight: -16, justifyContent: "center" }}>
      <img style={{ width: size, flexShrink: 0, maxWidth: "60px", objectFit: "contain", marginTop: -6, marginLeft: -32 }} src={require("../../assets/hot/hot.png")} />
      <H0 style={{ fontFamily: "'SF Mono', sans-serif", lineHeight: "60px", fontSize: size, fontWeight: "900" }} className={`balance-${id}`}>
        {left}
        <span style={{ fontFamily: "CabinetGrotesk", fontSize: size, fontWeight: "900" }}>.</span>
        {right}
      </H0>
    </div>
  );
};

export default observer(Balance);
