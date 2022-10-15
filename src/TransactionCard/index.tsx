import { QRCodeSVG } from "qrcode.react";
import { H2, Loading, Text } from "../uikit";
import { ViewTransaction } from "./ViewTransaction";
import { useSignRequest } from "./useSignRequest";
import { useEffect, useState } from "react";
import Footer from "../Footer";
import { isIOS } from "./utilts";
import * as S from "./styled";

const TransactionCard = () => {
  const { isLoading, deeplink, params } = useSignRequest();
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handler);
    handler();
    return () => window.removeEventListener("resize", handler);
  });

  useEffect(() => {
    window.location.href = deeplink;
  }, [deeplink]);

  if (params == null) {
    return null;
  }

  return (
    <>
      <S.Card isLoading={isLoading}>
        {isLoading && <Loading />}
        <ViewTransaction params={params}>
          {isMobile === false && (
            <S.ScanCode>
              <QRCodeSVG value={deeplink} bgColor="transparent" size={200} />
              <H2>Approve with QR</H2>
              <Text>Scan this code with your phone's camera to sign</Text>
            </S.ScanCode>
          )}
        </ViewTransaction>
      </S.Card>

      {isMobile && (
        <S.Card>
          <S.ScanCode>
            <QRCodeSVG value={deeplink} bgColor="transparent" size={200} />
            <H2>Approve with QR</H2>
            <Text>
              Scan this code with your phone's
              <br />
              camera to sign
            </Text>
          </S.ScanCode>
        </S.Card>
      )}

      <Footer deeplink={isMobile && isIOS() ? deeplink : null} />
    </>
  );
};

export default TransactionCard;
