import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

import { Button, Text, TinyText } from "../styled";
import { ConnectType } from "../utils";
import { notify } from "../notify";
import * as S from "./styled";

interface Props {
  style?: any;
  left?: boolean;
  onlySwitch?: boolean;
  className?: string;
  onSettings?: () => void;
  onAddAccount?: () => void;
  onDisconnect?: (id: string) => void;
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
  const { style = {}, className, onlySwitch, left, account, onSelect, onDisconnect, onSettings, onAddAccount } = props;
  const [openManager, setOpenManager] = useState(false);

  useEffect(() => {
    document.body.addEventListener("click", () => setOpenManager(false));
  }, []);

  return (
    <div className={className} style={{ display: "flex", ...style }}>
      {!onlySwitch && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setOpenManager(true);
          }}
        >
          <img src={require("../../src/icons/switch-vertical.svg")} />
        </Button>
      )}

      <S.AccountButton
        style={{ gap: 12, height: "auto", width: "auto", padding: 4 }}
        onClick={(e: any) => {
          e.stopPropagation();
          if (props.accounts.length > 1) setOpenManager(onlySwitch ? true : false);
        }}
      >
        <S.AvatarImage
          style={{ borderWidth: account.id ? 1 : 0 }}
          src={(() => {
            if (account.type === ConnectType.Here) return require("../../src/assets/here.svg");
            if (account.type === ConnectType.Ledger) return require("../../src/assets/ledger.png");
            if (account.type === ConnectType.Snap) return require("../../src/assets/metamask.svg");
            return require("../../src/assets/here.svg");
          })()}
        />

        {account.id ? (
          <>
            <div style={{ textAlign: "left", marginTop: -4 }}>
              <Text style={{ fontWeight: "bold" }}>{account.id.length > 16 ? account.id.slice(0, 8) + ".." + account.id.slice(-8) : account.id}</Text>

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
              <img src={require("../../src/icons/copy.svg")} />
            </Button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "left", marginTop: -4, marginRight: 8 }}>
              <Text style={{ fontWeight: "bold" }}>{walletName(account.type)}</Text>
              {account.type === ConnectType.Web ? <TinyText style={{ marginTop: 2 }}>Web wallet</TinyText> : <TinyText style={{ marginTop: 2 }}>Connect {(account as any).path || "new one"}</TinyText>}
            </div>
            {props.accounts.length > 1 && <img style={{ marginLeft: -8 }} src={require("../../src/icons/cursor-down.svg")} />}
          </>
        )}
      </S.AccountButton>

      {openManager && (
        <S.AccountMenu style={{ display: "flex", left: left ? 0 : "unset", flexDirection: "column", right: left ? "unset" : 0, width: 260 }}>
          {props.accounts
            .filter((t) => !account.id || account.id !== t.id)
            .map((acc) => {
              if (acc.id)
                return (
                  <S.AccountButtonSelect key={acc.id} style={{ paddingLeft: 4, gap: 8, width: "100%" }} onClick={() => onSelect?.(toJS(acc))}>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <Text style={{ fontWeight: "bold" }}>{acc.id.length > 16 ? acc.id.slice(0, 8) + ".." + acc.id.slice(-8) : acc.id}</Text>

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
                      <img src={require("../../src/icons/copy.svg")} />
                    </Button>
                  </S.AccountButtonSelect>
                );

              if (acc.type === ConnectType.Here)
                return (
                  <S.AccountButton key={acc.type + (acc.path || 0)} style={{ width: "100%" }} onClick={() => onSelect?.(acc)}>
                    <img width={32} height={32} style={{ objectFit: "contain" }} src={require("../../src/assets/here.svg")} />
                    <div style={{ marginLeft: 4, textAlign: "left", flex: 1 }}>
                      <Text>Use HERE Wallet</Text>
                      <TinyText>Mobile app</TinyText>
                    </div>
                  </S.AccountButton>
                );

              if (acc.type === ConnectType.Ledger)
                return (
                  <S.AccountButton key={acc.type + (acc.path || 0)} style={{ width: "100%" }} onClick={() => onSelect?.(acc)}>
                    <img width={32} height={32} style={{ objectFit: "contain" }} src={require("../../src/assets/ledger.png")} />
                    <div style={{ marginLeft: 4, textAlign: "left", flex: 1 }}>
                      <Text>Use Ledger {acc.path?.split("/").pop()}</Text>
                      <TinyText>{acc.path}</TinyText>
                    </div>
                  </S.AccountButton>
                );

              if (acc.type === ConnectType.Snap)
                return (
                  <S.AccountButton key={acc.type + (acc.path || 0)} style={{ width: "100%" }} onClick={() => onSelect?.(acc)}>
                    <img width={32} height={32} src={require("../../src/assets/metamask.svg")} />
                    <div style={{ marginLeft: 4, textAlign: "left", flex: 1 }}>
                      <Text>Use Metamask</Text>
                      <TinyText>Near Snap</TinyText>
                    </div>
                  </S.AccountButton>
                );

              return null;
            })}
        </S.AccountMenu>
      )}
    </div>
  );
});

export default AccountManager;
