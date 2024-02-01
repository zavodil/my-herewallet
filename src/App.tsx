import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { isTgMobile } from "./env";
import { Staking } from "./Staking";
import { GAME_ID } from "./core/Hot";
import { accounts } from "./core/Accounts";
import Inscription, { InscriptionTokens } from "./Inscription";
import { CustomRequestResolver, ImportAccountsResolver, KeypomResolver } from "./Widget/resolvers";
import TransferSuccess from "./Transfer/Success";
import CreateAccount from "./Auth/CreateAccount";
import ImportAccount from "./Auth/ImportAccount";
import ImportSeed from "./Auth/ImportSeed";
import OpenInApp from "./OpenInApp";
import Transfer from "./Transfer";
import Settings from "./Settings";
import Mobile from "./Mobile";
import Widget from "./Widget";
import Auth from "./Auth";
import Apps from "./Apps";
import Home from "./Home";

import { AnalyticsTracker } from "./core/analytics";
import CreateAccountMobile from "./AuthMobile/CreateAccountMobile";
import ImportAccountMobile from "./AuthMobile/ImportAccountMobile";
import AuthMobile from "./AuthMobile/AuthMobile";
import PopupsProvider, { sheets } from "./uikit/Popup";
import Boosters from "./Home/HOT/Boosters";
import Band from "./Home/HOT/Band";
import HOT from "./Home/HOT";
import Gas from "./Home/HOT/Gas";
import { NeedMoreGas } from "./Home/NeedGas";
import Onboard from "./Home/HOT/Onboard";
import { useHOTVillage } from "./Home/HOT/useVillage";
import Villages from "./Home/HOT/Villages";
import HotGuard from "./Home/HOT/HotGuard";
import { AppState } from "./core/network/api";
import { Root } from "./Home/styled";
import { Button, H1, H3, H4, Text } from "./uikit";
import { notify } from "./core/toast";
import { storage } from "./core/Storage";
import Icon from "./uikit/Icon";
import { SensitiveCard } from "./Settings/styled";

function App() {
  // useEffect(() => {
  //   if (!isTgMobile()) return;
  //   const targetElement = document.querySelector("#root");
  //   bodyScrollLock.disableBodyScroll(targetElement);
  // }, []);

  useHOTVillage();
  useEffect(() => {
    if (!isTgMobile() || !accounts.account) return;
    accounts.account.near.events.on("transaction:error", ({ error, actions, receiverId }) => {
      AnalyticsTracker.shared.track("transaction:error", { error: error?.toString?.() });
      if (!error?.toString()?.includes("does not have enough balance")) return;
      if (receiverId === GAME_ID && actions.length === 1 && actions[0].functionCall?.methodName === "claim") return;
      sheets.present({ id: "NeedGas", element: <NeedMoreGas /> });
    });
  }, [accounts.account]);

  const [openSeed, setSeed] = useState(false);

  if (AppState.shared.timeBreak) {
    const seed = storage.getAccount(storage.read()?.activeAccount!)?.seed;

    return (
      <Root style={{ textAlign: "center", justifyContent: "center", padding: 24, alignItems: "center" }}>
        <img src={require("./assets/hot/hot-blur.png")} style={{ position: "fixed", width: "100vw", top: -100, height: "100vh", objectFit: "contain" }} />

        <div style={{ marginTop: "auto", zIndex: 1000 }}>
          <img style={{ width: 164 }} src={require("./assets/error.png")} />
          <H4 style={{ marginTop: 24 }}>Technical break</H4>
          <Text>We're scaling the wallet infrastructure.</Text>
          <Text>The app will be available in 10 min.</Text>
        </div>

        <div style={{ marginTop: "auto", width: "100%", zIndex: 1000 }}>
          {seed != null && (
            <>
              <div style={{ display: "flex", gap: 8 }}>
                <H3>Passphrase</H3>
                <Button
                  $id="Settings.passphraseCopy"
                  onClick={async () => {
                    await navigator.clipboard.writeText(seed!);
                    notify("Passphrase has beed copied");
                  }}
                >
                  <Icon name="copy" />
                </Button>
              </div>

              <SensitiveCard onClick={() => setSeed(true)}>
                <div style={{ textAlign: "left", filter: !openSeed ? "blur(12px)" : "" }}>{seed}</div>
              </SensitiveCard>
            </>
          )}
        </div>
      </Root>
    );
  }

  if (isTgMobile()) {
    return (
      <>
        <PopupsProvider />
        <BrowserRouter>
          <Routes>
            {accounts.account && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/stake/*" element={<Staking />} />
                <Route path="/transfer/success" element={<TransferSuccess />} />
                <Route path="/transfer/*" element={<Transfer />} />
                <Route path="/apps/:id?" element={<Apps />} />
                <Route path="/settings/*" element={<Settings />} />
                <Route path="/hot/cave" element={<HotGuard Comp={Boosters} />} />
                <Route path="/hot/band" element={<HotGuard Comp={Band} />} />
                <Route path="/hot/gas" element={<HotGuard Comp={Gas} />} />
                <Route path="/hot/onboard" element={<HotGuard Comp={Onboard} />} />
                <Route path="/hot/villages" element={<HotGuard Comp={Villages} />} />
                <Route path="/hot/*" element={<HotGuard Comp={HOT} />} />
              </>
            )}

            <Route path="/auth/import" element={<ImportAccountMobile />} />
            <Route path="/auth/create" element={<CreateAccountMobile />} />
            <Route path="*" element={<AuthMobile />} />
          </Routes>
        </BrowserRouter>
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {accounts.account ? (
          <>
            <Route path="/" element={<Mobile Comp={Home} />} />
            <Route path="/stake/*" element={<Mobile Comp={Staking} />} />
            <Route path="/transfer/success" element={<Mobile Comp={TransferSuccess} />} />
            <Route path="/transfer/*" element={<Mobile Comp={Transfer} />} />
            <Route path="/apps/:id?" element={<Mobile Comp={Apps} />} />
            <Route path="/settings/*" element={<Mobile Comp={Settings} />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/stake/*" element={<Mobile Comp={Auth} />} />
            <Route path="/transfer/success" element={<Mobile Comp={Auth} />} />
            <Route path="/transfer/*" element={<Mobile Comp={Auth} />} />
            <Route path="/apps/:id?" element={<Mobile Comp={Apps} />} />
          </>
        )}

        <Route path="/auth" element={<Mobile Comp={Auth} />} />
        <Route path="/auth/create" element={<Mobile Comp={CreateAccount} />} />
        <Route path="/auth/import" element={<Mobile Comp={ImportAccount} />} />
        <Route path="/auth/import/backup" element={<Mobile Comp={ImportSeed} />} />

        <Route path="/connector/*" element={<Widget />} />
        <Route path="/inscription/tokens" element={<InscriptionTokens />} />
        <Route path="/inscription/:id?" element={<Inscription />} />

        <Route path="/g/:id?" element={<CustomRequestResolver />} />
        <Route path="/linkdrop/:id/:secret?" element={<KeypomResolver />} />
        <Route path="/import/*" element={<ImportAccountsResolver />} />
        <Route path="/request/:id?" element={<Widget />} />
        <Route path="*" element={<OpenInApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default observer(App);
