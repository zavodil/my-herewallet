import React, { useEffect, useRef, useState } from "react";
import { HereProviderResult, HereProviderStatus } from "@here-wallet/core";
import { QRCode } from "@here-wallet/core/build/qrcode-strategy";
import { KeyPairEd25519, PublicKey } from "near-api-js/lib/utils";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { Signature } from "near-api-js/lib/utils/key_pair";
import { NearSnap, NearSnapAccount } from "@near-snap/sdk";
import Transport from "@ledgerhq/hw-transport-webusb";
import AppNear from "@ledgerhq/hw-app-near";
import { Account, Signer } from "near-api-js";

import { ConnectType } from "../core/UserAccount";
import { AccountManager } from "../Home/Header";
import { accounts } from "../core/Accounts";
import { GlobalStyles } from "./styles";
import { wait } from "../core/helpers";
import { Text } from "../uikit";

const sendResponse = async (id: string, data: HereProviderResult) => {
  const res = await fetch(`https://h4n.app/${id}/response`, {
    body: JSON.stringify({ data: JSON.stringify(data) }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (!res.ok) throw Error();
};

class NearSnapAccountFixed extends NearSnapAccount {
  async activateIfNeeded(): Promise<any> {
    try {
      return await this.getLastNonce();
    } catch (e) {
      await wait(1000);
      await this.snap.needActivate(this.network).catch(() => {});
    }
  }
}

class LedgerSigner extends Signer {
  createKey(accountId: string, networkId?: string | undefined): Promise<PublicKey> {
    throw new Error("Method not implemented.");
  }

  async getPublicKey(accountId?: string | undefined, networkId?: string | undefined): Promise<PublicKey> {
    const transport = await Transport.create();
    const near = new AppNear(transport);
    const { publicKey } = await near.getAddress("44'/397'/0'/0'/1'");
    return PublicKey.from(publicKey);
  }

  async signMessage(message: Uint8Array): Promise<Signature> {
    const transport = await Transport.create();
    const near = new AppNear(transport);

    const { publicKey } = await near.getAddress("44'/397'/0'/0'/1'");
    const result = await near.signTransaction(message, "44'/397'/0'/0'/1'");

    if (result == null) throw Error();
    return { publicKey: PublicKey.from(publicKey), signature: new Uint8Array(result) };
  }
}

const Widget = () => {
  const [request, setRequest] = useState<{ id: string; request: any } | null>(null);
  const [isApproving, setApproving] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const link = `herewallet://request/${request?.id}`;
  const [type, setType] = useState(ConnectType.Here);

  const needSelect = request?.request.type === "sign";

  const connectLedger = async (id: string, request: any) => {
    const transport = await Transport.create();
    const near = new AppNear(transport);
    const result = await near.getAddress("44'/397'/0'/0'/1'");
    const account = new Account(
      {
        signer: new LedgerSigner(),
        provider: new JsonRpcProvider({ url: "https://rpc.herewallet.app" }),
        jsvmAccountId: "jsvm.mainnet",
        networkId: "mainnet",
      },
      result.address
    );

    await account.connection.signer.signMessage(Buffer.from("hello"));

    const pair = KeyPairEd25519.fromRandom();
    await account.addKey(pair.getPublicKey(), "herewallet.near");
    console.log(result);
  };

  const connectMetamask = async (id: string, request: any) => {
    console.log("connectMetamask");
    try {
      const snap = new NearSnap();
      await snap.install();

      if (request.type === "sign") {
        await sendResponse(id, { status: HereProviderStatus.APPROVING });

        const result = await snap.signMessage({
          message: request.message,
          network: (request.network as any) || "mainnet",
          recipient: request.recipient,
          nonce: request.nonce,
        });

        if (result == null) {
          await sendResponse(id, { status: HereProviderStatus.FAILED });
          return;
        }

        await sendResponse(id, {
          status: HereProviderStatus.SUCCESS,
          account_id: result.accountId,
          payload: JSON.stringify({
            signature: result.signature,
            accountId: result.accountId,
            publicKey: result.publicKey,
            type: ConnectType.Snap,
          }),
        });
      }

      if (request.type === "call") {
        await sendResponse(id, { status: HereProviderStatus.APPROVING }).catch(() => {});

        const credential = accounts.account?.credential;
        if (credential == null) return;

        const account = new NearSnapAccountFixed({
          publicKey: PublicKey.fromString(credential.publicKey),
          accountId: credential.accountId,
          network: "mainnet",
        });

        const result = await account.executeTransactions(request.transactions);
        if (result == null) {
          await sendResponse(request.id, { status: HereProviderStatus.FAILED });
          return;
        }

        await sendResponse(request.id, {
          status: HereProviderStatus.SUCCESS,
          account_id: credential.accountId,
          payload: JSON.stringify({
            transactions: result.map((t) => t.transaction_outcome.id),
            publicKey: credential.publicKey,
            type: ConnectType.Snap,
          }),
        });
      }
    } catch (e) {
      console.log("AZ", e);
    }
  };

  useEffect(() => {
    let type = accounts.account?.credential.type || ConnectType.Here;
    if (request?.request.type === "sign") type = ConnectType.Here;
    setType(type);

    if (request == null) return;
    if (type === ConnectType.Ledger) connectLedger(request.id, request.request);
    if (type === ConnectType.Snap) connectMetamask(request.id, request.request);
    if (type === ConnectType.Here) connectHere(request.id);
  }, [request, accounts.account]);

  const connectHere = async (id: string) => {
    if (window.localStorage.getItem("topic")) {
      fetch("https://api.herewallet.app/api/v1/transactions/topic/sign", {
        method: "POST",
        body: JSON.stringify({
          topic: window.localStorage.getItem("topic"),
          request_id: id,
        }),
      });
    }

    console.log("connectHERE");
    const link = `herewallet://request/${id}`;
    const qrcode = new QRCode({ ...darkQR, value: link });
    qrcode.canvas.classList.add("here-connector-card");
    qrcode.render();

    setTimeout(() => qrCodeRef.current?.appendChild(qrcode.canvas), 700);
  };

  const rejectButton = () => {
    parent?.postMessage(JSON.stringify({ type: "reject" }), "*");
  };

  useEffect(() => {
    window.addEventListener("message", (e) => {
      try {
        console.log(e.data);
        const event = JSON.parse(e.data);
        const { id, request } = event.payload;

        if (event.type === "request") {
          setRequest({ id, request });
          setApproving(false);
          return;
        }

        if (event.type === "approving" && isApproving === false) setApproving(true);
        if (event.topic) window.localStorage.setItem("topic", event.topic || "");
      } catch (e) {
        console.log(e);
      }
    });
  }, []);

  return (
    <div className="here-connector">
      <GlobalStyles />

      <div className="here-connector-overlay" onClick={rejectButton}></div>

      <div className="here-connector-content">
        {!needSelect && <AccountManager left onlySwitch style={{ position: "absolute", top: 24, left: 24 }} />}

        {needSelect && !mobileCheck() && (
          <>
            {/* {type === ConnectType.Here || type === ConnectType.Snap ? (
              <div
                className="here-connector-option"
                style={{ left: 48 }}
                // onClick={() => {
                //   setType(ConnectType.Ledger);
                //   if (request) connectLedger(request.id, request.request);
                // }}
              >
                <img width={156} height={156} src={require("../assets/ledger.png")} />
                <Text>Comming soon</Text>
              </div>
            ) : (
              <div
                className="here-connector-option"
                style={{ left: 48 }}
                onClick={() => {
                  setType(ConnectType.Here);
                  if (request) connectHere(request.id);
                }}
              >
                <img width={156} height={156} src={require("../assets/here.svg")} />
                <Text>Use HERE</Text>
              </div>
            )} */}

            {type === ConnectType.Here || type == ConnectType.Ledger ? (
              <div
                className="here-connector-option"
                style={{ right: 42 }}
                onClick={() => {
                  setType(ConnectType.Snap);
                  if (request) connectMetamask(request.id, request.request);
                }}
              >
                <img width={156} height={156} src={require("../assets/metamask.svg")} />
                <Text>Use Near Snap</Text>
              </div>
            ) : (
              <div
                className="here-connector-option"
                style={{ right: 42 }}
                onClick={() => {
                  setType(ConnectType.Here);
                  if (request) connectHere(request.id);
                }}
              >
                <img width={156} height={156} src={require("../assets/here.svg")} />
                <Text>Use HERE</Text>
              </div>
            )}
          </>
        )}

        {type === ConnectType.Snap && (
          <div className="here-connector-wrap">
            <div className="here-connector-card">
              <img width={156} height={156} src={require("../assets/metamask.svg")} />
            </div>
          </div>
        )}

        {type === ConnectType.Here && (
          <div className="here-connector-wrap" ref={qrCodeRef}>
            <div className="here-connector-card"></div>
          </div>
        )}

        {type === ConnectType.Ledger && (
          <div className="here-connector-wrap">
            <div className="here-connector-card">
              <img width={200} height={200} src={require("../assets/ledger.png")} />
            </div>
          </div>
        )}

        <button className="here-connector-close-button" onClick={rejectButton}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="rgb(44 48 52)">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </button>

        <footer className="here-connector-footer">
          <img src={require("../assets/nearhere.png")} alt="nearhere" />
          <img src={require("../assets/rock.png")} alt="rock" />

          {mobileCheck() && (
            <div className="here-connector-approve" onClick={() => window.open(link, "_top")}>
              Tap to approve HERE
            </div>
          )}

          <div className="here-connector-links">
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
          </div>
          <p>
            Don’t have an account yet? Visit <a href="https://herewallet.app">herewallet.app</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Widget;

const darkQR = {
  value: "",
  radius: 0.8,
  ecLevel: "H",
  fill: {
    type: "linear-gradient",
    position: [0, 0, 1, 1],
    colorStops: [
      [0, "#2C3034"],
      [0.34, "#4F5256"],
      [1, "#2C3034"],
    ],
  },
  size: 256,
  withLogo: true,
  imageEcCover: 0.7,
  quiet: 1,
} as const;

const mobileCheck = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent);
  return check;
};
