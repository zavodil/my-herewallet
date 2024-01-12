import { QRCode } from "@here-wallet/core/build/qrcode-strategy";
import React, { useEffect, useRef } from "react";

const HereQrcode = ({ requestId }: { requestId: string }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.localStorage.getItem("topic")) {
      fetch("https://api.herewallet.app/api/v1/transactions/topic/sign", {
        method: "POST",
        body: JSON.stringify({
          topic: window.localStorage.getItem("topic"),
          request_id: requestId,
        }),
      });
    }

    const link = `herewallet://request/${requestId}`;
    const qrcode = new QRCode({ ...darkQR, value: link });
    qrCodeRef.current?.appendChild(qrcode.canvas);
    qrcode.canvas.classList.add("here-connector-card");
    qrcode.render();
  }, [requestId]);

  return (
    <div className="here-connector-wrap" ref={qrCodeRef}>
      <div className="here-connector-card"></div>
    </div>
  );
};

export const darkQR = {
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

export default HereQrcode;
