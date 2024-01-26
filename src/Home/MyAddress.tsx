import React from "react";

import { useWallet } from "../core/Accounts";
import { notify } from "../core/toast";

import { SmallText, Text } from "../uikit/typographic";
import HereQRCode from "../uikit/HereQRCode";
import { colors } from "../uikit/theme";
import { HereButton } from "../uikit/button";
import Icon from "../uikit/Icon";

const MyAddress = () => {
  const wallet = useWallet();
  if (!wallet) return null;

  return (
    <div style={{ padding: 24, paddingBottom: 48 }}>
      <div style={{ width: "fit-content", borderRadius: 16, background: colors.elevation1, padding: 12, border: "1px solid var(--Stroke)", margin: "auto" }}>
        <HereQRCode value={wallet.id} />
      </div>

      <div style={{ display: "flex", gap: 32, justifyContent: "space-between", marginTop: 32 }}>
        <div>
          <SmallText>Your address</SmallText>
          <Text style={{ lineBreak: "anywhere" }}>{wallet.id}</Text>
        </div>

        <HereButton
          onClick={() => {
            navigator.clipboard.writeText(wallet.id);
            notify("Address has been copied");
          }}
        >
          <Icon name="copy" />
          Copy
        </HereButton>
      </div>
    </div>
  );
};

export default MyAddress;
