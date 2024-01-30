import React, { useEffect } from "react";
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
import { AnalyticsTracker } from "./core/analytics";

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

            <Route path="/auth/create" element={<CreateAccountMobile />} />
            <Route path="/auth/import" element={<ImportAccountMobile />} />
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
