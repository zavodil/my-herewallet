import React, { useEffect, useState } from "react";
import { formatNearAmount } from "near-api-js/lib/utils/format";
import { HereProviderRequest } from "@here-wallet/core";
import { observer } from "mobx-react-lite";
import Lottie from "lottie-react";
import isMobile from "is-mobile";
import { toJS } from "mobx";

import { AccountManager } from "../Home/Header";
import { Connector } from "../Connector/Connector/Transactions";
import { parseNearOfTransactions } from "../core/near-chain/utils";
import { Formatter, getStorageJson } from "../core/helpers";
import Currencies from "../core/token/Currencies";
import { ConnectType } from "../core/types";
import { accounts } from "../core/Accounts";

import { colors } from "../uikit/theme";
import { ActionButton, Button, H2, H4, Text } from "../uikit";
import HereInput from "../uikit/Input";
import Icon from "../uikit/Icon";

import { connectMetamask, connectLedger, connectWeb } from "./utils";
import HereQrcode from "./here";
import * as S from "./styled";
import { storage } from "../core/Storage";

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
  const [account, setAccount] = useState<{ id: string; path?: string; type: ConnectType }>();
  const [isLedger, setLedgerConnected] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [isNeedActivate, setNeedActivate] = useState("");
  const [password, setPassword] = useState("");
  const [isInit, setInit] = useState(accounts.accounts.length > 0);

  useEffect(() => {
    storage.storage = window.sessionStorage;
  }, []);

  const accountsList = toJS(accounts.accounts)
    .concat(isInit ? [] : [{ id: "", type: ConnectType.Web }])
    .concat([
      { id: "", type: ConnectType.Here },
      { id: "", type: ConnectType.Snap },
      { id: "", path: "44'/397'/0'/0'/0'", type: ConnectType.Ledger } as any,
      { id: "", path: "44'/397'/0'/0'/1'", type: ConnectType.Ledger } as any,
    ])
    .filter((t) => {
      const selector = request.selector || {};
      if (t.type === ConnectType.WalletConnect) return false;
      if (selector.id) return selector.id === t.id;
      if (selector.type) return selector.type === t.type && !t.id;
      return true;
    });

  const handleInit = async () => {
    const left = window.innerWidth / 2 - 360 / 2;
    const top = window.innerHeight / 2 - 100;
    const url = location.origin + "/loading";
    const params = "popup,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,width=360,height=300,visible=none";
    const w = window.open(url, "HereBridge", `${params}, left=${left}, top=${top}`);
    if (w == null) return;

    w.addEventListener("load", () => {
      w.addEventListener("message", (e: any) => {
        if (!e.data?.storage) return;

        Object.entries(e.data.storage).forEach(([key, value]) => {
          console.log(key, value);
          storage.storage.setItem(key, value as any);
        });

        accounts.init();
        if (accounts.accounts.length > 0) {
          localStorage.setItem("last-connect", JSON.stringify(toJS(accounts.accounts)[0]));
          setInit(true);
          w.close();
          return;
        }

        w.resizeTo(1280, 770);
        w.moveTo(window.screen.width / 2 - 1280 / 2, window.screen.height / 2 - 770 / 2);
        w.location.assign(location.origin + "/auth/create");
      });

      w?.postMessage({ password }, location.origin);
    });
  };

  useEffect(() => {
    if (request?.type == null) {
      setAccount(undefined);
      return;
    }

    const def = accounts.account
      ? { type: accounts.account.type, path: accounts.account.path, id: accounts.account.id }
      : { id: "", type: ConnectType.Here };

    const selected = getStorageJson("last-connect", def);
    const isExist = accountsList.find((t) => t.id === selected.id && t.type === selected.type);
    const acc = isExist ? selected : accountsList[0];
    setAccount(acc);
  }, [request, isInit]);

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

        if (event.type === "approving") {
          setApproving(true);
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
              setNeedActivate("");
              setLedgerConnected(false);
              localStorage.setItem("last-connect", JSON.stringify(account));
            }}
          />
        )}

        {account.type === ConnectType.Snap && (
          <div className="here-connector-wrap">
            <div
              className="here-connector-card snap-card"
              onClick={() => {
                setApproving(true);
                connectMetamask(account.id, requestId, request).catch(() => setApproving(false));
              }}
            >
              <img width={156} height={156} src={require("../assets/metamask.svg")} />
              <p style={{ marginTop: 0 }}>Tap to open</p>
            </div>
          </div>
        )}

        {account.type === ConnectType.Here && <HereQrcode requestId={requestId} />}

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
            ) : isNeedActivate ? (
              <>
                <h2>
                  Your account is not activated.
                  <br />
                  Transfer 0.1 NEAR to your Ledger address
                </h2>

                <div style={{ display: "flex", gap: 8, width: 300 }}>
                  <p style={{ lineBreak: "anywhere" }}>{isNeedActivate}</p>
                  <Button>
                    <Icon style={{ marginTop: 6, width: 24, height: 24 }} name="copy" />
                  </Button>
                </div>

                <S.ButtonSwitch
                  style={{ marginTop: 16 }}
                  onClick={() =>
                    connectLedger(
                      account,
                      requestId,
                      request,
                      setLedgerConnected,
                      () => setApproving(true),
                      setNeedActivate
                    )
                  }
                >
                  I did, connect again
                </S.ButtonSwitch>
              </>
            ) : (
              <>
                <h2>Connect to your Ledger device</h2>
                <p>Make sure your Ledger is connected securely, and that the NEAR app is open on your device.</p>

                <S.ButtonSwitch
                  style={{ marginTop: 16 }}
                  onClick={() =>
                    connectLedger(
                      account,
                      requestId,
                      request,
                      setLedgerConnected,
                      () => setApproving(true),
                      setNeedActivate
                    )
                  }
                >
                  Click to connect
                </S.ButtonSwitch>
              </>
            )}
          </S.LedgerWrap>
        )}

        {request != null && account.type === ConnectType.Web && (
          <>
            {isInit ? (
              <S.ConnectorWrap>
                <Connector request={toJS(request)} />
              </S.ConnectorWrap>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -32,
                  gap: 32,
                  flex: 1,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <H2>Enter password</H2>
                  <Text style={{ color: colors.blackSecondary }}>
                    If you don't have a password, leave this input blank
                  </Text>
                </div>

                <div style={{ width: 320 }}>
                  <HereInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <ActionButton style={{ width: 200 }} onClick={() => handleInit()}>
                  Unlock HERE
                </ActionButton>
              </div>
            )}
          </>
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
              {isMobile() && (
                <S.ApproveButton onClick={() => window.open(`herewallet://request/${requestId}`, "_top")}>
                  Tap to approve HERE
                </S.ApproveButton>
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

          {isInit && account.type === ConnectType.Web && (
            <ActionButton
              disabled={isApproving}
              style={{ width: 300, margin: "auto" }}
              onClick={() => {
                setApproving(true);
                connectWeb(account.id, requestId, request).catch(() => setApproving(false));
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
        </S.Footer>

        {isApproving && (
          <div
            style={{
              position: "absolute",
              background: "var(--Elevation-0)",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              display: "flex",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <Lottie
              animationData={require("../assets/loading.json")}
              style={{ width: 256, height: 256, marginTop: -56 }}
              width={48}
              height={48}
              loop={true}
            />
            <H4>Transaction is processing...</H4>
          </div>
        )}
      </div>
    </S.HereModal>
  );
};

export default observer(Widget);
