import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./assets/cabinet-grotesk/index.css";
import "./assets/manrope/index.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);


const customViewportCorrectionVariable = "vh";
function setViewportProperty(doc: any) {
  var prevClientHeight: any;
  var customVar = "--" + (customViewportCorrectionVariable || "vh");
  function handleResize() {
    var clientHeight = doc.clientHeight;
    if (clientHeight === prevClientHeight) return;
    requestAnimationFrame(function updateViewportHeight() {
      doc.style.setProperty(customVar, clientHeight * 0.01 + "px");
      prevClientHeight = clientHeight;
    });
  }
  handleResize();
  return handleResize;
}
window.addEventListener("resize", setViewportProperty(document.documentElement));
