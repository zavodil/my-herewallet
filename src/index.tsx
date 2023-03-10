import { Buffer } from "buffer/";
import Process from "process";
// @ts-ignore
globalThis.Buffer = Buffer;
globalThis.process = Process;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./assets/cabinet-grotesk/index.css";
import "./assets/manrope/index.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

parent.postMessage({ action: "parentDomain", data: document.referrer }, "*");
document.addEventListener("click", (e) => {
  console.log(e);
  let target = (e.target as HTMLElement)?.closest("a");
  if (target instanceof HTMLAnchorElement) {
    parent.postMessage({ action: "openLink", data: { link: target.href } }, "*");
  }
});
