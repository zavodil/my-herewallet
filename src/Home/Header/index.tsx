import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import hereWebLogo from "../../assets/here-web.svg?url";
import { useAnalyticsTrack } from "../../core/analytics";
import { accounts, useWallet } from "../../core/Accounts";

import { Button } from "../../uikit";
import { H2, SmallText, Text } from "../../uikit/typographic";
import Icon from "../../uikit/Icon";
import { isTgMobile } from "../../Mobile";

import AccountManager from "./AccountsManager";
import * as S from "./styled";
import { sheets } from "../../uikit/Popup";
import HereQRCode from "../../uikit/HereQRCode";
import { colors } from "../../uikit/theme";
import { HereButton } from "../../uikit/button";
import { notify } from "../../core/toast";

const MyQRPopup = () => {
  const wallet = useWallet();
  if (!wallet) return null;

  return (
    <div style={{ padding: 24, paddingBottom: 48 }}>
      <div
        style={{
          width: "fit-content",
          borderRadius: 16,
          background: colors.elevation1,
          padding: 12,
          border: "1px solid var(--Stroke)",
          margin: "auto",
        }}
      >
        <HereQRCode value={wallet.id} />
      </div>

      <div style={{ display: "flex", gap: 32, marginTop: 32 }}>
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

const Header = observer(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const track = useAnalyticsTrack("app");

  useEffect(() => {
    track("open", { from: document.referrer });
  }, []);

  if (isTgMobile()) {
    return (
      <S.Header style={{ height: 56, padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 8 }} onClick={() => navigate("/")}>
          <img src={require("../../assets/here.svg")} />
          <H2 style={{ fontSize: 20 }}>NEAR WALLET</H2>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Button onClick={() => sheets.present({ id: "MyQR", element: <MyQRPopup /> })}>
            <Icon name="qr" />
          </Button>

          <Button onClick={() => navigate("/settings")}>
            <Icon name="settings" />
          </Button>
        </div>
      </S.Header>
    );
  }

  return (
    <S.Header>
      <Link to="/" className="header-left">
        <img style={{ width: 165, height: 22, objectFit: "contain" }} src={hereWebLogo} />
      </Link>

      {accounts.account != null && (
        <S.NavBar>
          <Link to="/">
            <S.NavButton $active={location.pathname === "/"}>Home</S.NavButton>
          </Link>

          <Link to="/stake">
            <S.NavButton $active={location.pathname === "/stake"}>Stake</S.NavButton>
          </Link>

          <Link to="/apps">
            <S.NavButton $active={location.pathname === "/apps"}>Apps</S.NavButton>
          </Link>
        </S.NavBar>
      )}

      {accounts.account && (
        <AccountManager
          onSelect={({ id }) => accounts.select(id)}
          accounts={accounts.accounts}
          account={accounts.account}
          className="header-right"
        />
      )}
    </S.Header>
  );
});

export default Header;
