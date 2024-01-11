import React from "react";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Staking } from "./Staking";
import Home from "./Home";

import { accounts } from "./core/Accounts";
import Inscription, { InscriptionTokens } from "./Inscription";
import { CustomRequestResolver, ImportAccountsResolver, KeypomResolver } from "./Connector/RequstResolver";
import { LoadingPage } from "./Connector/Loading";
import TransferSuccess from "./Transfer/Success";
import CreateAccount from "./Auth/CreateAccount";
import ImportAccount from "./Auth/ImportAccount";
import OpenInApp from "./Connector/OpenInApp";
import ImportSeed from "./Auth/ImportSeed";
import WebConnector from "./Connector";
import Transfer from "./Transfer";
import Settings from "./Settings";
import Mobile from "./Mobile";
import Widget from "./Widget";
import Auth from "./Auth";
import Apps from "./Apps";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {accounts.account ? (
          <>
            <Route path="/" element={<Mobile Comp={Home} />} />
            <Route path="/stake/*" element={<Mobile Comp={Staking} />} />
            <Route path="/transfer/success" element={<Mobile Comp={TransferSuccess} />} />
            <Route path="/transfer/*" element={<Mobile Comp={Transfer} />} />
            <Route path="/apps/*" element={<Mobile Comp={Apps} />} />
            <Route path="/settings/*" element={<Mobile Comp={Settings} />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/stake/*" element={<Mobile Comp={Auth} />} />
            <Route path="/transfer/success" element={<Mobile Comp={Auth} />} />
            <Route path="/transfer/*" element={<Mobile Comp={Auth} />} />
            <Route path="/apps/*" element={<Mobile Comp={Apps} />} />
          </>
        )}

        <Route path="/auth" element={<Mobile Comp={Auth} />} />
        <Route path="/auth/create" element={<Mobile Comp={CreateAccount} />} />
        <Route path="/auth/import" element={<Mobile Comp={ImportAccount} />} />
        <Route path="/auth/import/backup" element={<Mobile Comp={ImportSeed} />} />

        <Route path="/connector/*" element={<Widget />} />
        <Route path="/inscription/tokens" element={<InscriptionTokens />} />
        <Route path="/inscription/:id?" element={<Inscription />} />

        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/g/:id?" element={<CustomRequestResolver />} />
        <Route path="/linkdrop/:id/:secret?" element={<KeypomResolver />} />
        <Route path="/request/:id" element={<WebConnector />} />
        <Route path="/import/*" element={<ImportAccountsResolver />} />
        <Route path="*" element={<OpenInApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default observer(App);
