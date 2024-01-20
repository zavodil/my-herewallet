import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import hereWebLogo from "../../assets/here-web.svg?url";
import { useAnalyticsTrack } from "../../core/analytics";
import { accounts } from "../../core/Accounts";

import { Button } from "../../uikit";
import { H2 } from "../../uikit/typographic";
import { sheets } from "../../uikit/Popup";
import Icon from "../../uikit/Icon";

import { isTgMobile } from "../../Mobile";
import AccountManager from "./AccountsManager";
import * as S from "./styled";
import MyAddress from "../MyAddress";

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
