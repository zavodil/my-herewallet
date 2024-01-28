import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import Icon from "../uikit/Icon";
import { colors } from "../uikit/theme";
import { ActionButton, Button, H1 } from "../uikit";
import { useWallet } from "../core/Accounts";
import { storage } from "../core/Storage";
import { isTgMobile } from "../Mobile";

import { ExportAccountWidget } from "./Header/ExportAccountWidget";

const ExportBanner = () => {
  const account = useWallet()!;
  const [isHide, setHide] = useState(() => account.localStorage.get("export_banner_hide", false));
  const [isOpen, setOpen] = useState(false);

  if (storage.getAccount(account.id)?.privateKey) return null;
  if (isTgMobile()) return null;
  if (isHide) return null;

  const hideBanner = () => {
    account.localStorage.set("export_banner_hide", true);
    setHide(true);
  };

  return (
    <>
      {isOpen && <ExportAccountWidget onClose={() => setOpen(false)} />}
      <div
        style={{
          backgroundImage: `url(${require("../assets/here-banner-bg.svg")})`,
          backgroundSize: "cover",
          backgroundColor: "rgba(253, 174, 255, 1)",
          width: "100%",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "0 24px 0",
          gap: 28,
        }}
      >
        <div style={{ flexShrink: 0, margin: "24px 0" }}>
          <H1 style={{ flexShrink: 0, textTransform: "uppercase", fontSize: 24, lineHeight: "32px" }}>
            Export your wallet
            <br />
            to HERE Mobile App
          </H1>
        </div>

        <div style={{ maxWidth: 246, width: "100%", marginTop: "auto", paddingTop: 16, display: "flex", alignItems: "flex-end" }}>
          <img style={{ objectFit: "contain", width: "100%" }} src={require("../assets/here-banner.png")} />
        </div>

        <div style={{ maxWidth: 175, width: "100%", margin: "24px 0" }} onClick={() => setOpen(true)}>
          <ActionButton style={{ width: "100%", height: 48 }}>Export</ActionButton>
        </div>

        <Button style={{ position: "absolute", top: 8, right: 8 }} onClick={() => hideBanner()}>
          <Icon color={colors.blackSecondary} name="cross" />
        </Button>
      </div>
    </>
  );
};

export default observer(ExportBanner);
