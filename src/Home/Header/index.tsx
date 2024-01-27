import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import hereWebLogo from "../../assets/here-web.svg?url";
import { useAnalyticsTrack } from "../../core/analytics";
import { accounts } from "../../core/Accounts";

import { Button } from "../../uikit";
import { BoldP, H2 } from "../../uikit/typographic";
import { sheets } from "../../uikit/Popup";
import Icon from "../../uikit/Icon";

import { isTgMobile } from "../../Mobile";
import MyAddress from "../MyAddress";

import AccountManager from "./AccountsManager";
import * as S from "./styled";

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
          <Button onClick={() => sheets.present({ id: "MyQR", element: <MyAddress /> })}>
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
      <div className="header-left">
        <Link to="/">
          <img style={{ width: 165, height: 22, objectFit: "contain" }} src={hereWebLogo} />
        </Link>

        <S.FollowTwitterLink
          href="https://twitter.com/here_wallet"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", backgroundColor: "rgba(29, 155, 240, 0.1)", padding: "6px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
        >
          <img style={{ objectFit: "contain", width: 24 }} src={require("../../assets/twitter-blue.svg")} />
          <BoldP>Follow us</BoldP>
        </S.FollowTwitterLink>
      </div>

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
          onDisconnect={(id) => accounts.disconnect(id)}
          onAddAccount={() => navigate("/auth")}
          onSettings={() => navigate("/settings")}
          accounts={accounts.accounts}
          account={accounts.account}
          className="header-right"
        />
      )}
    </S.Header>
  );
});

export default Header;
