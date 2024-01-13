import React from "react";
import ReactDOM from "react-dom/client";

import "./assets/cabinet-grotesk/index.css";
import "./assets/manrope/index.css";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

window.addEventListener("message", (e) => {
  if (e.data.password != null && e.origin === location.origin) {
    window.parent.postMessage({ storage: { ...localStorage } }, location.origin);
  }
});
