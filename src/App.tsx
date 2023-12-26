import React from "react";
import { observer } from "mobx-react-lite";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Staking } from "./Staking";
import Home from "./Home";

import { accounts } from "./core/Accounts";
import { CustomRequestResolver, ImportAccountsResolver, KeypomResolver } from "./Connector/RequstResolver";
import { LoadingPage } from "./Connector/Loading";
import TransferSuccess from "./Transfer/Success";
import CreateNickname from "./Auth/CreateNickname";
import OpenInApp from "./Connector/OpenInApp";
import WebConnector from "./Connector";
import Transfer from "./Transfer";
import Auth from "./Auth";
import Apps from "./Apps";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {accounts.account ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/nickname" element={<CreateNickname />} />
            <Route path="/stake/*" element={<Staking />} />
            <Route path="/transfer/success" element={<TransferSuccess />} />
            <Route path="/transfer/*" element={<Transfer />} />
            <Route path="/apps/*" element={<Apps />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Auth />} />
            <Route path="/nickname" element={<Auth />} />
            <Route path="/stake/*" element={<Auth />} />
            <Route path="/transfer/success" element={<Auth />} />
            <Route path="/transfer/*" element={<Auth />} />
            <Route path="/apps/*" element={<Apps />} />
          </>
        )}

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
