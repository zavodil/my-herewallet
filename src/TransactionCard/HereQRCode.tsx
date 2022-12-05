import { useEffect, useRef } from "react";
import { lightQR, QRCode } from "@here-wallet/near-selector/qrcode-strategy";

const HereQRCode = ({ value, isNew }: { value: string; isNew: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current == null) return;

    const qrcode = new QRCode({
      ...lightQR,
      withLogo: isNew,
      ecLevel: isNew ? "H" : "L",
      value,
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
