import React, { useState } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { LoadingPage } from "./WebConnector/Loading";
import WebConnector from "./WebConnector";
import { Staking } from "./Staking";

function App() {
  const [useHash] = useState(() => window.location.search === "?stake");

  if (useHash) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/stake/*" element={<Staking />} />
          <Route path="*" element={<Staking />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/stake/*" element={<Staking />} />
        <Route path="*" element={<WebConnector />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
