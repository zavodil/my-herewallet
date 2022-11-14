import { QRCodeSVG } from "qrcode.react";
import { H2, H3, Loading, Text } from "../uikit";
import { ViewTransaction } from "./ViewTransaction";
import { useSignRequest } from "./useSignRequest";
import { useEffect, useState } from "react";
import Footer from "../Footer";
import { isIOS } from "./utilts";
import * as S from "./styled";

const TransactionCard = () => {
  const { isLoading, deeplink, error, params } = useSignRequest();
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handler);
    handler();
    return () => window.removeEventListener("resize", handler);
  });

  if (params == null) {
    return (
      <div
        style={{
          height: "100vh",
          flexDirection: "column",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {error ? (
          <>
            <H2 style={{ textAlign: "center" }}>Request not found</H2>
            <H3>Go back to the web3 app and retry the transaction</H3>
          </>
        ) : (
          <Loading />
        )}
      </div>
    );
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
