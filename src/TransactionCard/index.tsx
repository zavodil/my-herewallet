import { useEffect, useState } from "react";
import { HereProviderStatus } from "@here-wallet/near-selector";

import { H2, H3, Loading, Text } from "../uikit";
import Footer from "../Footer";

import HereQRCode from "./HereQRCode";
import { ViewTransaction } from "./ViewTransaction";
import { useSignRequest } from "./useSignRequest";
import { isIOS } from "./utilts";
import * as S from "./styled";

const TransactionCard = () => {
  const { result, isNew, link, args } = useSignRequest();
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handler);
    handler();
    return () => window.removeEventListener("resize", handler);
  });

  if (result?.status === HereProviderStatus.FAILED) {
    return (
      <S.Container>
        <H2 style={{ textAlign: "center" }}>Something went wrong</H2>
        <H3>Go back to the web3 app and retry the transaction</H3>
      </S.Container>
    );
  }

  if (result?.status === HereProviderStatus.SUCCESS) {
    return (
      <S.Container>
        <H2 style={{ textAlign: "center" }}>Success</H2>
        <H3>Go back to the web3 app</H3>
      </S.Container>
    );
  }

  if (args == null) {
    return (
      <S.Container>
        <Loading />
      </S.Container>
    );
  }

  return (
    <>
      <S.Card isLoading={result?.status === HereProviderStatus.APPROVING}>
        {result?.status === HereProviderStatus.APPROVING && <Loading />}
        <ViewTransaction args={args}>
          {isMobile === false && (
            <S.ScanCode>
              <HereQRCode isNew={isNew} value={link} />
              <H2>Approve with QR</H2>
              <Text>Scan this code with your phone's camera to sign</Text>
            </S.ScanCode>
          )}
        </ViewTransaction>
      </S.Card>

      {isMobile && (
        <S.Card>
          <S.ScanCode>
            <HereQRCode isNew={isNew} value={link} />
            <H2>Approve with QR</H2>
            <Text>
              Scan this code with your phone's
              <br />
              camera to sign
            </Text>
          </S.ScanCode>
        </S.Card>
      )}

      <Footer deeplink={isMobile && isIOS() ? link : null} />
    </>
  );
};

export default TransactionCard;
