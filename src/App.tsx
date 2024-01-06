import React from "react";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Staking } from "./Staking";
import Home from "./Home";

import { accounts } from "./core/Accounts";
import { CustomRequestResolver, ImportAccountsResolver, KeypomResolver } from "./Connector/RequstResolver";
import { LoadingPage } from "./Connector/Loading";
import TransferSuccess from "./Transfer/Success";
import OpenInApp from "./Connector/OpenInApp";
import WebConnector from "./Connector";
import Transfer from "./Transfer";
import Auth from "./Auth";
import Apps from "./Apps";
import Widget from "./Widget";
import CreateAccount from "./Auth/CreateAccount";
import ImportAccount from "./Auth/ImportAccount";
import Inscription, { InscriptionTokens } from "./Inscription";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {accounts.account ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/stake/*" element={<Staking />} />
            <Route path="/transfer/success" element={<TransferSuccess />} />
            <Route path="/transfer/*" element={<Transfer />} />
            <Route path="/apps/*" element={<Apps />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/stake/*" element={<Auth />} />
            <Route path="/transfer/success" element={<Auth />} />
            <Route path="/transfer/*" element={<Auth />} />
            <Route path="/apps/*" element={<Apps />} />
          </>
        )}

        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/create" element={<CreateAccount />} />
        <Route path="/auth/import" element={<ImportAccount />} />

        <Route path="/connector" element={<Widget />} />
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
