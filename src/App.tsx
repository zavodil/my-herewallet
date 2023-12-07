import React from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Staking } from "./Staking";
import Home from "./Home";

import {
  CustomRequestResolver,
  ImportAccountsResolver,
  KeypomResolver,
} from "./Connector/RequstResolver";
import { LoadingPage } from "./Connector/Loading";
import { AppContextProvider } from "./core/useWallet";
import OpenInApp from "./Connector/OpenInApp";
import WebConnector from "./Connector";

function App() {
  if (window.location.search === "?stake") {
    return (
      <HashRouter>
        <Routes>
          <Route path="*" element={<Staking />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/stake/*" element={<Staking />} />
          <Route path="/import/*" element={<ImportAccountsResolver />} />
          <Route path="/g/:id?" element={<CustomRequestResolver />} />
          <Route path="/linkdrop/:id/:secret?" element={<KeypomResolver />} />
          <Route path="/request/:id" element={<WebConnector />} />
          <Route path="*" element={<OpenInApp />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;
