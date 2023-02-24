import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoadingPage } from "./WebConnector/Loading";
import WebConnector from "./WebConnector";
import { Staking } from "./Staking";

function App() {
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
