import React, { useEffect, useRef } from "react";
import { darkQR, QRCode } from "@here-wallet/core/build/qrcode-strategy";

const HereQRCode = ({ value, size = 200 }: { value: string; size?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current == null) return;

    const qrcode = new QRCode({
      ...darkQR,
      size,
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
      value: value,
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
