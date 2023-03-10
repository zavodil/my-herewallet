import React, { useEffect, useRef } from "react";
import { darkQR, QRCode } from "@here-wallet/core";

const HereQRCode = ({
  value,
  useAppclip,
  network,
}: {
  value: string;
  network?: string;
  useAppclip: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current == null) return;

    const url = new URL(value);
    if (useAppclip && network !== "testnet") {
      url.protocol = "https";
    }

    const qrcode = new QRCode({
      ...darkQR,
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
      value: url.toString(),
    });

    const root = ref.current;
    root.appendChild(qrcode.canvas);
    qrcode.render();

    return () => {
      root.removeChild(qrcode.canvas);
    };
  });

  return <div ref={ref} />;
};

export default HereQRCode;
