import React, { useEffect, useRef, useState } from "react";
import { mobileCheck, connectHere, connectMetamask, connectLedger } from "./utils";
import { ConnectType } from "../core/types";
import * as S from "./styled";

let globalRequest: any = null;
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
  const [request, setRequest] = useState<{ id: string; request: any } | null>(globalRequest);
  const [isApproving, setApproving] = useState(false);
  const [isLedger, setLedgerConnected] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const link = `herewallet://request/${request?.id}`;
  const [type, setType] = useState(localStorage.getItem("connector-type") || ConnectType.Here);

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
          setRequest({ id, request });
          setApproving(false);
          return;
        }

        if (event.topic) window.localStorage.setItem("topic", event.topic || "");
      } catch (e) {}
    });
  }, []);

  useEffect(() => {
    if (request == null) return;
    localStorage.setItem("connector-type", type);
    if (type === ConnectType.Here) {
      connectHere(request.id, qrCodeRef.current!);
    }
  }, [request, type]);

  return (
    <S.HereModal>
      <S.GlobalStyles />
      <div className="here-connector-overlay" onClick={rejectButton}></div>

      <div className="here-connector-content">
        <S.SwitchersWrap>
          {!mobileCheck() && type !== ConnectType.Snap && (
            <S.ButtonSwitch onClick={() => !isApproving && setType(ConnectType.Snap)}>
              <img width={24} height={24} src={require("../assets/metamask.svg")} />
              Use MetaMask
            </S.ButtonSwitch>
          )}

          {!mobileCheck() && type !== ConnectType.Here && (
            <S.ButtonSwitch onClick={() => !isApproving && setType(ConnectType.Here)}>
              <img style={{ objectFit: "contain" }} width={28} height={28} src={require("../assets/here.svg")} />
              Use HERE Wallet
            </S.ButtonSwitch>
          )}

          {type !== ConnectType.Ledger && (
            <S.ButtonSwitch onClick={() => !isApproving && setType(ConnectType.Ledger)}>
              <img style={{ objectFit: "contain" }} width={28} height={28} src={require("../assets/ledger.png")} />
              Use Ledger
            </S.ButtonSwitch>
          )}
        </S.SwitchersWrap>

        {!isApproving && type === ConnectType.Snap && (
          <div className="here-connector-wrap">
            <div
              className="here-connector-card snap-card"
              onClick={() => {
                setApproving(true);
                connectMetamask(request!.id, request!.request).finally(() => setApproving(false));
              }}
            >
              <img width={156} height={156} src={require("../assets/metamask.svg")} />
              <p style={{ marginTop: 0 }}>Tap to open</p>
            </div>
          </div>
        )}

        {!isApproving && type === ConnectType.Here && (
          <div className="here-connector-wrap" ref={qrCodeRef}>
            <div className="here-connector-card"></div>
          </div>
        )}

        {!isApproving && type === ConnectType.Ledger && (
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
                  onClick={() => connectLedger(request!.id, request!.request, setLedgerConnected)}
                >
                  Click to connect
                </S.ButtonSwitch>
              </>
            )}
          </S.LedgerWrap>
        )}

        {isApproving && (
          <div className="here-connector-wrap">
            <div className="here-connector-card">
              <div className="loading-spin">
                <div />
                <div />
                <div />
              </div>
            </div>
          </div>
        )}

        <S.CloseButton onClick={rejectButton}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="rgb(44 48 52)">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </S.CloseButton>

        <S.Footer>
          <img src={require("../assets/nearhere.png")} alt="nearhere" />
          <img src={require("../assets/rock.png")} alt="rock" />

          {mobileCheck() && (
            <S.ApproveButton onClick={() => window.open(link, "_top")}>Tap to approve HERE</S.ApproveButton>
          )}

          {type === ConnectType.Here && (
            <>
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

          {type === ConnectType.Snap && (
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

export default Widget;
