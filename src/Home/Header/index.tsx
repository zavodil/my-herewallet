import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

import hereWebLogo from "../../assets/here-web.svg?url";
import { useAnalyticsTrack } from "../../core/analytics";
import { accounts } from "../../core/Accounts";
import { ConnectType } from "../../core/types";
import { notify } from "../../core/toast";

import { Button, Text } from "../../uikit";
import { TinyText } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import Icon from "../../uikit/Icon";

import { ExportAccountWidget } from "./ExportAccountWidget";
import * as S from "./styled";

interface Props {
  style?: any;
  left?: boolean;
  onlySwitch?: boolean;
  className?: string;
  accounts: { id: string; type: ConnectType }[];
  account: { id: string; type: ConnectType };
  onSelect?: (t: { id: string; type: ConnectType }) => void;
}

const walletName = (type: ConnectType) => {
  if (type === ConnectType.Here) return "HERE Wallet";
  if (type === ConnectType.Ledger) return "Ledger Wallet";
  if (type === ConnectType.Snap) return "Metamask Wallet";
  if (type === ConnectType.Web) return "Web Wallet";
  if (type === ConnectType.Meteor) return "Meteor Wallet";
  if (type === ConnectType.MyNearWallet) return "MyNearWallet";
  if (type === ConnectType.WalletConnect) return "Wallet Connect";
  if (type === ConnectType.Sender) return "Sender Wallet";
};
export const AccountManager = observer((props: Props) => {
  const { style = {}, className, onlySwitch, left, account, onSelect } = props;
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openManager, setOpenManager] = useState(false);
  const [isExportOpen, setToggleExport] = useState(false);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    document.body.addEventListener("click", () => {
      setOpenMenu(false);
      setOpenManager(false);
    });
  }, []);

  useEffect(() => {
    console.log("dsfjkd");
    setAvatar("");
    accounts.getAvatar(account.id, account.type).then(setAvatar);
  }, [account]);

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
          if (props.accounts.length > 1) setOpenManager(onlySwitch ? true : false);
        }}
      >
        <S.AvatarImage style={{ borderWidth: account.id ? 1 : 0 }} src={avatar} />
        {account.id ? (
          <>
            <div style={{ textAlign: "left", marginTop: -4 }}>
              <Text style={{ fontWeight: "bold" }}>
                {account.id.length > 16 ? account.id.slice(0, 8) + ".." + account.id.slice(-8) : account.id}
              </Text>

              <TinyText style={{ marginTop: 2 }}>{walletName(account.type)}</TinyText>
            </div>
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                await navigator.clipboard.writeText(account.id);
                notify("Account address has beed copied");
              }}
            >
              <Icon name="copy" />
            </Button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "left", marginTop: -4, marginRight: 8 }}>
              <Text style={{ fontWeight: "bold" }}>{walletName(account.type)}</Text>
              <TinyText style={{ marginTop: 2 }}>Connect new one</TinyText>
            </div>

            {props.accounts.length > 1 && <Icon style={{ marginLeft: -8 }} name="cursor-down" />}
          </>
        )}
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
              accounts.disconnect(account.id);
            }}
          >
            <Icon name="logout" />
            <Text style={{ color: colors.red }}>Log out</Text>
          </S.AccountButton>
        </S.AccountMenu>
      )}

      {openManager && (
        <S.AccountMenu style={{ left: left ? 0 : "unset", right: left ? "unset" : 0 }}>
          {props.accounts
            .filter((t) => account.id !== t.id)
            .map((acc) => {
              if (acc.id)
                return (
                  <S.AccountButton
                    key={acc.id}
                    style={{ justifyContent: "space-between" }}
                    onClick={() => onSelect?.(toJS(acc))}
                  >
                    <div style={{ textAlign: "left", marginTop: -4 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {acc.id.length > 16 ? acc.id.slice(0, 8) + ".." + acc.id.slice(-8) : acc.id}
                      </Text>

                      <TinyText style={{ marginTop: 2 }}>{walletName(acc.type)}</TinyText>
                    </div>

                    <Button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(acc.id);
                        notify("Account address has beed copied");
                      }}
                    >
                      <Icon name="copy" />
                    </Button>
                  </S.AccountButton>
                );

              if (acc.type === ConnectType.Here)
                return (
                  <S.AccountButton key={acc.type} onClick={() => onSelect?.({ id: "", type: ConnectType.Here })}>
                    <img
                      style={{ objectFit: "contain" }}
                      width={28}
                      height={28}
                      src={require("../../assets/here.svg")}
                    />
                    <Text>Use HERE Wallet</Text>
                  </S.AccountButton>
                );

              if (acc.type === ConnectType.Ledger)
                return (
                  <S.AccountButton key={acc.type} onClick={() => onSelect?.({ id: "", type: ConnectType.Ledger })}>
                    <img
                      style={{ objectFit: "contain" }}
                      width={28}
                      height={28}
                      src={require("../../assets/ledger.png")}
                    />
                    <Text>Use Ledger</Text>
                  </S.AccountButton>
                );

              if (acc.type === ConnectType.Snap)
                return (
                  <S.AccountButton key={acc.type} onClick={() => onSelect?.({ id: "", type: ConnectType.Snap })}>
                    <img width={24} height={24} src={require("../../assets/metamask.svg")} />
                    <Text style={{ marginLeft: 4 }}>Use Metamask</Text>
                  </S.AccountButton>
                );

              return null;
            })}

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
});

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
