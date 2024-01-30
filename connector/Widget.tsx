import React, { useEffect, useState } from "react";
import { HereProviderRequest } from "@here-wallet/core";
import Lottie from "lottie-react";
import isMobile from "is-mobile";

import AccountsManager from "../src/Home/Header/AccountsManager";
import { getStorageJson } from "../src/core/helpers";
import { ConnectType } from "../src/core/types";

import { Button, H4 } from "../src/uikit";
import Icon from "../src/uikit/Icon";

import { connectMetamask, connectLedger } from "./utils";
import HereQrcode from "./here";
import * as S from "./styled";

window.addEventListener("message", (e) => {
  try {
    const data = JSON.parse(e.data);
    if (data.type !== "request") return;
    // @ts-ignore
    window.hereRequest = data.payload.request;
    // @ts-ignore
    window.requestId = data.payload.id;
  } catch {}
});

const useRequest = () => {
  const [request, setRequest] = useState<HereProviderRequest>();
  const [id, setId] = useState("");

  useEffect(() => {
    // @ts-ignore
    if (window.hereRequest) setRequest(window.hereRequest); // @ts-ignore
    if (window.requestId) setId(window.requestId);
    window.addEventListener("message", (e) => {
      try {
        console.log(e.data);
        const data = JSON.parse(e.data);
        if (data.type !== "request") return;
        setRequest(data.payload.request);
        setId(data.payload.id);
      } catch {}
    });
  }, []);

  return { request, id };
};

const Widget = () => {
  const { request, id } = useRequest();
  const [account, setAccount] = useState({ type: ConnectType.Here, id: "" });
  const [isLedger, setLedgerConnected] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [isNeedActivate, setNeedActivate] = useState("");

  const desktop = [
    { id: "", type: ConnectType.Snap },
    { id: "", type: ConnectType.Ledger },
  ];

  const accountsList = [{ id: "", type: ConnectType.Here }].concat(isMobile() ? [] : desktop).filter((t) => {
    const selector = request?.selector || {};
    if (t.type === ConnectType.WalletConnect) return false;
    if (selector.id) return selector.id === t.id;
    if (selector.type) return selector.type === t.type && !t.id;
    return true;
  });

  useEffect(() => {
    const def = { id: "", type: ConnectType.Here };
    const selected = getStorageJson("last-connect", def);
    const isExist = accountsList.find((t) => t.id === selected.id && t.type === selected.type);
    setAccount(isExist ? selected : accountsList[0]);
  }, [request]);

  const rejectButton = () => {
    if (isApproving) return;
    top?.postMessage(JSON.stringify({ type: "reject" }), "*");
  };

  if (request == null) {
    return <S.HereModal />;
  }

  return (
    <S.HereModal>
      <AccountsManager
        left
        onlySwitch
        account={account}
        accounts={accountsList}
        style={{ position: "absolute", top: isMobile() ? 16 : 24 }}
        onSelect={(acc) => {
          setAccount(acc);
          setNeedActivate("");
          setLedgerConnected(false);
          localStorage.setItem("last-connect", JSON.stringify(acc));
        }}
      />

      {account.type === ConnectType.Snap && (
        <div className="here-connector-wrap">
          <div
            className="here-connector-card snap-card"
            onClick={() => {
              setApproving(true);
              connectMetamask(account.id, id, request);
            }}
          >
            <img width={156} height={156} src={require("../src/assets/metamask.svg")} />
            <p style={{ marginTop: 0 }}>Tap to open</p>
          </div>
        </div>
      )}

      {account.type === ConnectType.Here && <HereQrcode requestId={id} />}

      {account.type === ConnectType.Ledger && (
        <S.LedgerWrap>
          <div style={{ position: "relative" }}>
            <S.LedgerBlur1 $green={isLedger} />
            <S.LedgerBlur2 $green={isLedger} />
            <img src={require("../src/assets/ledger.png")} />
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
                <Button $id="Connector.copyAddress">
                  <Icon style={{ marginTop: 6, width: 24, height: 24 }} name="copy" />
                </Button>
              </div>

              <S.ButtonSwitch style={{ marginTop: 16 }} onClick={() => connectLedger(account, id, request, setLedgerConnected, () => setApproving(true), setNeedActivate)}>
                I did, connect again
              </S.ButtonSwitch>
            </>
          ) : (
            <>
              <h2>Connect to your Ledger device</h2>
              <p>Make sure your Ledger is connected securely, and that the NEAR app is open on your device.</p>

              <S.ButtonSwitch style={{ marginTop: 16 }} onClick={() => connectLedger(account, id, request, setLedgerConnected, () => setApproving(true), setNeedActivate)}>
                Click to connect
              </S.ButtonSwitch>
            </>
          )}
        </S.LedgerWrap>
      )}

      <S.CloseButton onClick={rejectButton}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="rgb(44 48 52)">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      </S.CloseButton>

      <S.Footer>
        <img src={require("../src/assets/nearhere.png")} alt="nearhere" />
        <img src={require("../src/assets/rock.png")} alt="rock" />

        {account.type === ConnectType.Here && (
          <>
            {isMobile() && <S.ApproveButton onClick={() => window.open(`herewallet://request/${id}`, "_top")}>Tap to approve HERE</S.ApproveButton>}

            <S.Links>
              <a target="_parent" rel="noopener noreferrer" className="here-connector-ios" href="https://download.herewallet.app?ios">
                <img src={require("../src/assets/appstore.svg")} />
              </a>

              <a target="_parent" rel="noopener noreferrer" className="here-connector-android" href="https://download.herewallet.app?android">
                <img src={require("../src/assets/googleplay.svg")} />
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
                <img style={{ width: 32, height: 32 }} src={require("../src/assets/chrome.svg")} />
                <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>Install Metamask</p>
              </a>
            </S.Links>

            <p>
              Don’t have an account yet? Visit <a href="https://my.herewallet.app">my.herewallet.app</a>
            </p>
          </>
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
          <Lottie animationData={require("../src/assets/loading.json")} style={{ width: 256, height: 256, marginTop: -56 }} width={48} height={48} loop={true} />
          <H4>Transaction is processing...</H4>
        </div>
      )}
    </S.HereModal>
  );
};

export default Widget;
