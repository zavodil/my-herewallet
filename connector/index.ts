import QRCode from "@here-wallet/core/build/qrcode-strategy/qrcode";

const loadingIndicator = () => `
<div class="here-connector-card">
    <div class="loading-spin">
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const connectorWrap = document.body.querySelector<HTMLDivElement>(".here-connector-wrap")!;
  const connectorApprove = document.body.querySelector<HTMLDivElement>(".here-connector-approve")!;
  const closeButton = document.body.querySelector<HTMLDivElement>(".here-connector-close-button")!;

  let isApproving = false;
  window.addEventListener("message", (event) => {
    try {
      const { type, payload } = JSON.parse(event.data);

      if (type === "request") {
        const link = `herewallet://h4n.app/${payload.id}`;
        isApproving = false;

        const qrcode = new QRCode({ ...darkQR, value: link });
        qrcode.canvas.classList.add("here-connector-card");
        connectorWrap.innerHTML = "";
        connectorWrap.appendChild(qrcode.canvas);
        qrcode.render();

        connectorApprove.onclick = () => parent.location.assign(link);
        connectorApprove.removeAttribute("disabled");

        closeButton.onclick = () => parent?.postMessage(JSON.stringify({ type: "reject" }), "*");
        closeButton.style.visibility = "";
      }

      if (type === "approving" && isApproving === false) {
        closeButton.style.visibility = "hidden";
        connectorApprove.setAttribute("disabled", "true");
        connectorWrap.innerHTML = loadingIndicator();
        isApproving = true;
      }
    } catch {}
  });
});

const darkQR = {
  value: "",
  radius: 0.8,
  ecLevel: "H",
  fill: {
    type: "linear-gradient",
    position: [0, 0, 1, 1],
    colorStops: [
      [0, "#2C3034"],
      [0.34, "#4F5256"],
      [1, "#2C3034"],
    ],
  },
  size: 256,
  withLogo: true,
  imageEcCover: 0.7,
  quiet: 1,
} as const;

const lightQR = {
  value: "",
  radius: 0.8,
  ecLevel: "H",
  fill: {
    type: "linear-gradient",
    position: [0.3, 0.3, 1, 1],
    colorStops: [
      [0, "#FDBF1C"],
      [1, "#FDA31C"],
    ],
  },
  size: 256,
  withLogo: true,
  imageEcCover: 0.7,
  quiet: 1,
} as const;
