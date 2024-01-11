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
import { generateFromString } from "generate-avatar";

interface Props {
  style?: any;
  left?: boolean;
  onlySwitch?: boolean;
  className?: string;
  accounts: { id: string; path?: string; type: ConnectType }[];
  account: { id: string; type: ConnectType; path?: string };
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
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.addEventListener("click", () => {
      setOpenMenu(false);
      setOpenManager(false);
    });
  }, []);

  useEffect(
    () => {
      setAvatars({});
      props.accounts.forEach((acc) => {
        accounts.getAvatar(acc.id, acc.type).then((url) => setAvatars((t) => ({ ...t, [acc.id]: url })));
      });
    },
    props.accounts.map((t) => t.id)
  );

  console.log(account.path);

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
        <S.AvatarImage
          as={avatars[account.id] ? "img" : "div"}
          style={{ borderWidth: account.id ? 1 : 0 }}
          src={avatars[account.id]}
        />
        {account.id ? (
          <>
            <div style={{ textAlign: "left", marginTop: -4 }}>
              <Text style={{ fontWeight: "bold" }}>
                {account.id.length > 16 ? account.id.slice(0, 8) + ".." + account.id.slice(-8) : account.id}
              </Text>

              <TinyText style={{ marginTop: 2 }}>
                {walletName(account.type)} {account.path?.split("/").pop()}
              </TinyText>
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
              <TinyText style={{ marginTop: 2 }}>Connect {(account as any).path || "new one"}</TinyText>
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
        <S.AccountMenu
          style={{
            left: left ? 0 : "unset",
            display: "flex",
            flexDirection: "column",
            width: 320,
            gap: 8,
            right: left ? "unset" : 0,
          }}
        >
          {props.accounts
            .filter((t) => !account.id || account.id !== t.id)
            .map((acc) => {
              if (acc.id)
                return (
                  <S.AccountButtonSelect
                    key={acc.id}
                    style={{ paddingLeft: 4, gap: 8, width: "100%" }}
                    onClick={() => onSelect?.(toJS(acc))}
                  >
                    <S.AvatarImage
                      as={avatars[acc.id] ? "img" : "div"}
                      style={{ borderWidth: acc.id ? 1 : 0 }}
                      src={avatars[acc.id]}
                    />

                    <div style={{ textAlign: "left", flex: 1, overflowX: "hidden" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {acc.id.length > 16 ? acc.id.slice(0, 8) + ".." + acc.id.slice(-8) : acc.id}
                      </Text>

                      <TinyText style={{ marginTop: 2 }}>
                        {walletName(acc.type)} {acc.path}
                      </TinyText>
                    </div>

                    <Button
                      style={{ marginLeft: "auto", flexShrink: 0 }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(acc.id);
                        notify("Account address has beed copied");
                      }}
                    >
                      <Icon name="copy" />
                    </Button>
                  </S.AccountButtonSelect>
                );

              if (acc.type === ConnectType.Here)
                return (
                  <S.AccountButton
                    key={acc.type + (acc.path || 0)}
                    style={{ width: "100%" }}
                    onClick={() => onSelect?.(acc)}
                  >
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
                  <S.AccountButton
                    key={acc.type + (acc.path || 0)}
                    style={{ width: "100%" }}
                    onClick={() => onSelect?.(acc)}
                  >
                    <img
                      style={{ objectFit: "contain" }}
                      width={28}
                      height={28}
                      src={require("../../assets/ledger.png")}
                    />
                    <div style={{ textAlign: "left", flex: 1, overflowX: "hidden" }}>
                      <Text>Use Ledger {acc.path?.split("/").pop()}</Text>
                      <TinyText>{acc.path}</TinyText>
                    </div>
                  </S.AccountButton>
                );

              if (acc.type === ConnectType.Snap)
                return (
                  <S.AccountButton
                    key={acc.type + (acc.path || 0)}
                    style={{ width: "100%" }}
                    onClick={() => onSelect?.(acc)}
                  >
                    <img width={24} height={24} src={require("../../assets/metamask.svg")} />
                    <Text style={{ marginLeft: 4 }}>Use Metamask</Text>
                  </S.AccountButton>
                );

              return null;
            })}

          {!onlySwitch && (
            <S.AccountButton
              style={{ width: "100%" }}
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
