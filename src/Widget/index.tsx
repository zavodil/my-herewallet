import React, { useEffect, useRef, useState } from "react";
import { formatNearAmount } from "near-api-js/lib/utils/format";
import { HereProviderRequest } from "@here-wallet/core";
import { toJS } from "mobx";

import { Connector } from "../Connector/Connector/Transactions";
import { parseNearOfTransactions } from "../core/near-chain/utils";
import { Formatter, getStorageJson } from "../core/helpers";
import Currencies from "../core/token/Currencies";
import { ConnectType } from "../core/types";
import { accounts } from "../core/Accounts";
import { ActionButton } from "../uikit";

import { AccountManager } from "../Home/Header";
import { mobileCheck, connectHere, connectMetamask, connectLedger, connectWeb } from "./utils";
import * as S from "./styled";
import { observer } from "mobx-react-lite";

let globalRequest: any = { id: "", request: {} };
window.addEventListener("message", (e) => {
  try {
    const event = JSON.parse(e.data);
    if (event.type === "request") {
      const { id, request } = event.payload;
      globalRequest = { id, request };
      return;
    }

    if (event.topic) window.localStorage.setItem("topic", event.topic || "");
  } catch (e) {}
});

const Widget = () => {
  const [requestId, setRequestId] = useState(globalRequest.id);
  const [request, setRequest] = useState<HereProviderRequest>(globalRequest.request);
  const [account, setAccount] = useState<{ id: string; type: ConnectType }>();
  const [isLedger, setLedgerConnected] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const link = `herewallet://request/${requestId}`;
  const accountsList = toJS(accounts.accounts)
    .concat([
      { id: "", type: ConnectType.Here },
      { id: "", type: ConnectType.Ledger },
      { id: "", type: ConnectType.Snap },
    ])
    .filter((t) => {
      // @ts-ignore
      const selector = request.selector || {};
      if (selector.id) return selector.id === t.id;
      if (selector.type) return selector.type === t.type && !t.id;
      return true;
    });

  useEffect(() => {
    if (request?.type == null) {
      setAccount(undefined);
      return;
    }

    const def = accounts.account
      ? { type: accounts.account.type, id: accounts.account.id }
      : { id: "", type: ConnectType.Here };

    const selected = getStorageJson("last-connect", def);
    const isExist = accountsList.find((t) => t.id === selected.id && t.type === selected.type);
    const acc = isExist ? selected : accountsList[0];

    if (acc.type === ConnectType.Here) connectHere(account?.id || "", requestId, qrCodeRef.current!);
    setAccount(acc);
  }, [request]);

  const rejectButton = () => {
    if (isApproving) return;
    parent?.postMessage(JSON.stringify({ type: "reject" }), "*");
  };

  useEffect(() => {
    window.addEventListener("message", (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === "request") {
          const { id, request } = event.payload;
          setRequest(request);
          setRequestId(id);
          setApproving(false);
          return;
        }

        if (event.topic) window.localStorage.setItem("topic", event.topic || "");
      } catch (e) {}
    });
  }, []);

  if (request.type == null || account == null) {
    return (
      <S.HereModal>
        <S.GlobalStyles />
        <div className="here-connector-overlay" onClick={rejectButton}></div>
        <div className="here-connector-content"></div>
      </S.HereModal>
    );
  }

  return (
    <S.HereModal>
      <S.GlobalStyles />
      <div className="here-connector-overlay" onClick={rejectButton}></div>
      <div className="here-connector-content">
        {request.type != null && (
          <AccountManager
            left
            onlySwitch
            account={account}
            accounts={accountsList}
            style={{ position: "absolute", top: 24 }}
            onSelect={(acc) => {
              setAccount(acc);
              localStorage.setItem("last-connect", JSON.stringify(account));
              if (acc.type === ConnectType.Here) {
                connectHere(account.id, requestId, qrCodeRef.current!);
              }
            }}
          />
        )}

        {account.type === ConnectType.Snap && (
          <div className="here-connector-wrap">
            <div
              className="here-connector-card snap-card"
              onClick={() => {
                setApproving(true);
                connectMetamask(account.id, requestId, request).finally(() => setApproving(false));
              }}
            >
              <img width={156} height={156} src={require("../assets/metamask.svg")} />
              <p style={{ marginTop: 0 }}>Tap to open</p>
            </div>
          </div>
        )}

        {account.type === ConnectType.Here && (
          <div className="here-connector-wrap" ref={qrCodeRef}>
            <div className="here-connector-card"></div>
          </div>
        )}

        {account.type === ConnectType.Ledger && (
          <S.LedgerWrap>
            <div style={{ position: "relative" }}>
              <S.LedgerBlur1 $green={isLedger} />
              <S.LedgerBlur2 $green={isLedger} />
              <img src={require("../assets/ledger.png")} />
            </div>

            {isLedger ? (
              <>
                <h2>
                  Please confirm the operation
                  <br />
                  on your device..
                </h2>
                <p>You will need to confirm the transaction details on your Ledger</p>
              </>
            ) : (
              <>
                <h2>Connect to your Ledger device</h2>
                <p>Make sure your Ledger is connected securely, and that the NEAR app is open on your device.</p>
                <S.ButtonSwitch
                  style={{ marginTop: 16 }}
                  onClick={() => connectLedger(account.id, requestId, request, setLedgerConnected)}
                >
                  Click to connect
                </S.ButtonSwitch>
              </>
            )}
          </S.LedgerWrap>
        )}

        {request != null && account.type === ConnectType.Web && (
          <S.ConnectorWrap>
            <Connector request={toJS(request)} />
            {accounts.account != null && (
              <ActionButton
                disabled={isApproving}
                style={{ width: 300, margin: "auto" }}
                onClick={() => {
                  setApproving(true);
                  connectWeb(account.id, requestId, request).finally(() => setApproving(false));
                }}
              >
                Approve all
                {request.type === "call" &&
                  ` (${Formatter.usd(
                    +formatNearAmount(parseNearOfTransactions(request.transactions).toString()) *
                      Currencies.shared.usd("NEAR")
                  )})`}
              </ActionButton>
            )}
          </S.ConnectorWrap>
        )}

        <S.CloseButton onClick={rejectButton}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="rgb(44 48 52)">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </S.CloseButton>

        <S.Footer>
          <img src={require("../assets/nearhere.png")} alt="nearhere" />
          <img src={require("../assets/rock.png")} alt="rock" />

          {account.type === ConnectType.Here && (
            <>
              {mobileCheck() && (
                <S.ApproveButton onClick={() => window.open(link, "_top")}>Tap to approve HERE</S.ApproveButton>
              )}

              <S.Links>
                <a
                  target="_parent"
                  rel="noopener noreferrer"
                  className="here-connector-ios"
                  href="https://download.herewallet.app?ios"
                >
                  <img src={require("../assets/appstore.svg")} />
                </a>

                <a
                  target="_parent"
                  rel="noopener noreferrer"
                  className="here-connector-android"
                  href="https://download.herewallet.app?android"
                >
                  <img src={require("../assets/googleplay.svg")} />
                </a>
              </S.Links>
              <p>
                Don’t have an account yet? Visit <a href="https://herewallet.app">herewallet.app</a>
              </p>
            </>
          )}

          {account.type === ConnectType.Snap && (
            <>
              <S.Links style={{ maxWidth: "fit-content" }}>
                <a
                  target="_parent"
                  rel="noopener noreferrer"
                  className="here-connector-ios"
                  href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=metamask.io"
                  style={{ padding: "8px 12px", alignItems: "center", gap: "8px" }}
                >
                  <img style={{ width: 32, height: 32 }} src={require("../assets/chrome.svg")} />
                  <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>Install Metamask</p>
                </a>
              </S.Links>

              <p>
                Don’t have an account yet? Visit <a href="https://my.herewallet.app">my.herewallet.app</a>
              </p>
            </>
          )}
        </S.Footer>
      </div>
    </S.HereModal>
  );
};

export default observer(Widget);
