import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

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
  accounts: { id: string; path?: string; type: ConnectType }[];
  account: { id: string; type: ConnectType; path?: string };
  onSelect?: (t: { id: string; type: ConnectType }) => void;
}

export const walletName = (type: ConnectType) => {
  if (type === ConnectType.Here) return "HERE Wallet";
  if (type === ConnectType.Ledger) return "Ledger Wallet";
  if (type === ConnectType.Snap) return "Metamask Wallet";
  if (type === ConnectType.Web) return "Web Wallet";
  if (type === ConnectType.WalletConnect) return "Wallet Connect";
};

const AccountManager = observer((props: Props) => {
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
        accounts.getAvatar(acc.id, acc.type).then((url) => {
          setAvatars((t) => ({ ...t, [acc.id || acc.type]: url }));
        });
      });
    },
    props.accounts.map((t) => t.id)
  );

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
          as={account.id ? (avatars[account.id] ? "img" : "div") : "img"}
          style={{ borderWidth: account.id ? 1 : 0 }}
          src={avatars[account.id || account.type]}
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
              {account.type === ConnectType.Web ? (
                <TinyText style={{ marginTop: 2 }}>Web wallet</TinyText>
              ) : (
                <TinyText style={{ marginTop: 2 }}>Connect {(account as any).path || "new one"}</TinyText>
              )}
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
              navigate("/settings");
            }}
          >
            <Icon name="settings" />
            <Text>Settings</Text>
          </S.AccountButton>

          <S.AccountButton
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(false);
              setToggleExport(true);
            }}
          >
            <Icon name="switch_horizontal" />
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
            display: "flex",
            left: left ? 0 : "unset",
            flexDirection: "column",
            right: left ? "unset" : 0,
            width: 260,
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
                    <div style={{ textAlign: "left", flex: 1 }}>
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
                      width={32}
                      height={32}
                      style={{ objectFit: "contain" }}
                      src={require("../../assets/here.svg")}
                    />
                    <div style={{ marginLeft: 4, textAlign: "left", flex: 1 }}>
                      <Text>Use HERE Wallet</Text>
                      <TinyText>Mobile app</TinyText>
                    </div>
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
                      width={32}
                      height={32}
                      style={{ objectFit: "contain" }}
                      src={require("../../assets/ledger.png")}
                    />
                    <div style={{ marginLeft: 4, textAlign: "left", flex: 1 }}>
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
                    <img width={32} height={32} src={require("../../assets/metamask.svg")} />
                    <div style={{ marginLeft: 4, textAlign: "left", flex: 1 }}>
                      <Text>Use Metamask</Text>
                      <TinyText>Near Snap</TinyText>
                    </div>
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

export default AccountManager;
