import React, { useEffect, useState } from "react";
import { HereProviderStatus } from "@here-wallet/core";

import { colors } from "../uikit/theme";
import { isAndroid, isIOS } from "../utilts";
import { ActionButton, H2, H3, Loading, Text } from "../uikit";
import { Connector } from "../Connector";
import Footer from "../Footer";

import { useSignRequest } from "./useSignRequest";
import HereQRCode from "./HereQRCode";
import * as S from "./styled";

const TransactionCard = () => {
  const { result, link, request } = useSignRequest();
  const [useAppclip, setAppclip] = useState(localStorage.getItem("disableAppClip") == null);

  const isMobile = isAndroid() || isIOS();
  const handleOpen = () => {
    window.location.assign(link);
  };

  useEffect(() => {
    if (useAppclip) localStorage.removeItem("disableAppClip");
    else localStorage.setItem("disableAppClip", "1");
  }, [useAppclip]);

  if (result?.status === HereProviderStatus.FAILED) {
    return (
      <S.Container>
        <H2 style={{ textAlign: "center" }}>Something went wrong</H2>
        <H3 style={{ textAlign: "center" }}>Go back to the web3 app and retry the transaction</H3>
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

  if (request == null) {
    return (
      <S.Container>
        <Loading />
      </S.Container>
    );
  }

  const toggleAppClipWidget = (
    <span onClick={() => setAppclip((v) => !v)} style={{ color: colors.pink, cursor: "pointer" }}>
      {useAppclip ? "Doesn't work?" : "Use AppClip"}
    </span>
  );

  return (
    <>
      <S.Wrap>
        {/* <View
          style={{
            width: "fit-content",
            backgroundColor: colors.orange,
            paddingHorizontal: 12,
            borderRadius: 16,
            marginBottom: 16,
            marginTop: 32,
            padding: 6,
          }}
        >
          <Text style={{ fontWeight: 700 }}>
            If something doesn't work, <Nobr>update the app to the latest version</Nobr>
          </Text>
        </View> */}

        <S.Card isLoading={result?.status === HereProviderStatus.APPROVING}>
          {result?.status === HereProviderStatus.APPROVING && <Loading />}
          <Connector request={request} />

          {isMobile === false && (
            <S.ScanCode>
              <HereQRCode
                useAppclip={useAppclip && request.type !== "import"}
                network={request.network}
                value={link}
              />
              <H2>Approve with QR</H2>
              <Text>
                Scan this code with your phone's camera to sign.{" "}
                {request.type !== "import" && toggleAppClipWidget}
              </Text>
            </S.ScanCode>
          )}
        </S.Card>

        {isMobile && <ActionButton onClick={handleOpen}>Tap to approve in HERE</ActionButton>}
      </S.Wrap>
      <Footer />
    </>
  );
};

export default TransactionCard;
