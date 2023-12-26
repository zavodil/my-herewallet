import React, { useEffect, useRef, useState } from "react";
import { mobileCheck, ConnectType, connectHere, connectMetamask } from "./utils";

const Widget = () => {
  const [request, setRequest] = useState<{ id: string; request: any } | null>(null);
  const [isApproving, setApproving] = useState(true);
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
      } catch (e) {
        console.log(e);
      }
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
    <div className="here-connector">
      <div className="here-connector-overlay" onClick={rejectButton}></div>

      <div className="here-connector-content">
        {!mobileCheck() && type === ConnectType.Here && (
          <div className="here-connector-switch" onClick={() => !isApproving && setType(ConnectType.Snap)}>
            <img width={24} height={24} src={require("../src/assets/metamask.svg")} />
            Use MetaMask Near Snap
          </div>
        )}

        {!mobileCheck() && type === ConnectType.Snap && (
          <div className="here-connector-switch" onClick={() => !isApproving && setType(ConnectType.Here)}>
            <img style={{ objectFit: "contain" }} width={28} height={28} src={require("../src/assets/here.svg")} />
            Use HERE Wallet
          </div>
        )}

        {!isApproving && type === ConnectType.Snap && (
          <div className="here-connector-wrap">
            <div
              className="here-connector-card snap-card"
              onClick={() => {
                setApproving(true);
                connectMetamask(request!.id, request!.request).finally(() => setApproving(false));
              }}
            >
              <img width={156} height={156} src={require("../src/assets/metamask.svg")} />
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
          <div className="here-connector-wrap">
            <div className="here-connector-card">
              <img width={200} height={200} src={require("../src/assets/ledger.png")} />
            </div>
          </div>
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

        <button className="here-connector-close-button" onClick={rejectButton}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="rgb(44 48 52)">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </button>

        <footer className="here-connector-footer">
          <img src={require("../src/assets/nearhere.png")} alt="nearhere" />
          <img src={require("../src/assets/rock.png")} alt="rock" />

          {mobileCheck() && (
            <div className="here-connector-approve" onClick={() => window.open(link, "_top")}>
              Tap to approve HERE
            </div>
          )}

          {type === ConnectType.Here && (
            <>
              <div className="here-connector-links">
                <a
                  target="_parent"
                  rel="noopener noreferrer"
                  className="here-connector-ios"
                  href="https://download.herewallet.app?ios"
                >
                  <img src={require("../src/assets/appstore.svg")} />
                </a>

                <a
                  target="_parent"
                  rel="noopener noreferrer"
                  className="here-connector-android"
                  href="https://download.herewallet.app?android"
                >
                  <img src={require("../src/assets/googleplay.svg")} />
                </a>
              </div>
              <p>
                Don’t have an account yet? Visit <a href="https://herewallet.app">herewallet.app</a>
              </p>
            </>
          )}

          {type === ConnectType.Snap && (
            <>
              <div className="here-connector-links" style={{ maxWidth: "fit-content" }}>
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
              </div>
              <p>
                Don’t have an account yet? Visit <a href="https://my.herewallet.app">my.herewallet.app</a>
              </p>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Widget;
