import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { generateFromString } from "generate-avatar";
import { observer } from "mobx-react-lite";

import hereWebLogo from "../../assets/here-web.svg?url";
import { useAnalyticsTrack } from "../../core/analytics";
import { accounts, useWallet } from "../../core/Accounts";
import { ConnectType } from "../../core/types";
import { notify } from "../../core/toast";

import Icon from "../../uikit/Icon";
import { Button, Text } from "../../uikit";
import { colors } from "../../uikit/theme";
import { TinyText } from "../../uikit/typographic";

import { ExportAccountWidget } from "./ExportAccountWidget";
import * as S from "./styled";

export const AccountManager = observer(
  ({
    style = {},
    className,
    onlySwitch,
    left,
  }: {
    className?: string;
    style?: any;
    left?: boolean;
    onlySwitch?: boolean;
  }) => {
    const account = useWallet()!;
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [openManager, setOpenManager] = useState(false);
    const [isExportOpen, setToggleExport] = useState(false);

    useEffect(() => {
      document.body.addEventListener("click", () => {
        setOpenMenu(false);
        setOpenManager(false);
      });
    }, []);

    if (account == null) return null;
    const accountId = account.near.accountId;

    return (
      <div className={className} style={{ display: "flex", ...style }}>
        {!onlySwitch && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setOpenManager(true);
              setOpenMenu(false);
            }}
          >
            <Icon name="switch-vertical" />
          </Button>
        )}

        <S.AccountButton
          style={{ gap: 12, height: "auto", width: "auto", padding: 4 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(onlySwitch ? false : true);
            setOpenManager(onlySwitch ? true : false);
          }}
        >
          <S.AvatarImage src={account.user.avatar_url || `data:image/svg+xml;utf8,${generateFromString(accountId)}`} />
          <div style={{ textAlign: "left", marginTop: -4 }}>
            <Text style={{ fontWeight: "bold" }}>
              {accountId.length > 16 ? accountId.slice(0, 8) + ".." + accountId.slice(-8) : accountId}
            </Text>

            <TinyText style={{ marginTop: 2 }}>
              {account.credential.type === ConnectType.Here && "HERE Wallet"}
              {account.credential.type === ConnectType.Ledger && "Ledger Wallet"}
              {account.credential.type === ConnectType.Snap && "Metamask Wallet"}
            </TinyText>
          </div>

          <Button
            onClick={async (e) => {
              e.stopPropagation();
              await navigator.clipboard.writeText(account.near.accountId);
              notify("Account address has beed copied");
            }}
          >
            <Icon name="copy" />
          </Button>
        </S.AccountButton>

        {openMenu && (
          <S.AccountMenu
            style={{ left: left ? 0 : "unset", right: left ? "unset" : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenManager(false);
            }}
          >
            <S.AccountButton
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(false);
                setToggleExport(true);
              }}
            >
              <Text>Export wallet</Text>
            </S.AccountButton>

            <S.AccountButton
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(false);
                accounts.disconnect(account.credential.accountId);
              }}
            >
              <Icon name="logout" />
              <Text style={{ color: colors.red }}>Log out</Text>
            </S.AccountButton>
          </S.AccountMenu>
        )}

        {openManager && (
          <S.AccountMenu style={{ left: left ? 0 : "unset", right: left ? "unset" : 0 }}>
            {accounts.accounts.map((acc) => (
              <S.AccountButton
                style={{ justifyContent: "space-between" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenManager(false);
                  accounts.select(acc.accountId);
                }}
              >
                <div style={{ textAlign: "left", marginTop: -4 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {acc.accountId.length > 16
                      ? acc.accountId.slice(0, 8) + ".." + acc.accountId.slice(-8)
                      : acc.accountId}
                  </Text>

                  <TinyText style={{ marginTop: 2 }}>
                    {acc.type === ConnectType.Here && "HERE Wallet"}
                    {acc.type === ConnectType.Ledger && "Ledger Wallet"}
                    {acc.type === ConnectType.Snap && "Metamask Wallet"}
                    {acc.type === ConnectType.Web && "Web Wallet"}
                  </TinyText>
                </div>

                <Button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(acc.accountId);
                    notify("Account address has beed copied");
                  }}
                >
                  <Icon name="copy" />
                </Button>
              </S.AccountButton>
            ))}

            {!onlySwitch && (
              <S.AccountButton
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(false);
                  setOpenManager(false);
                  navigate("/auth");
                }}
              >
                <Icon width={16} name="add" />
                <Text>Add wallet</Text>
              </S.AccountButton>
            )}
          </S.AccountMenu>
        )}

        <ExportAccountWidget onClose={() => setToggleExport(false)} isOpen={isExportOpen} />
      </div>
    );
  }
);

const Header = observer(() => {
  const location = useLocation();
  const track = useAnalyticsTrack("app");

  useEffect(() => {
    track("open", { from: document.referrer });
  }, []);

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

      <AccountManager className="header-right" />
    </S.Header>
  );
});

export default Header;
