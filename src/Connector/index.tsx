import React from "react";
import { HereProviderStatus } from "@here-wallet/core";
import { useParams } from "react-router-dom";
import { isMobile } from "is-mobile";

import HereQRCode from "../uikit/HereQRCode";
import { ActionButton, H2, H3, ActivityIndicator, Text } from "../uikit";
import { Connector } from "./Connector/Transactions";
import Footer from "./Footer";

import { useSignRequest } from "./useSignRequest";
import * as S from "./styled";

const TransactionCard = () => {
  const { id } = useParams();
  const { result, link, request } = useSignRequest(id);

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
        <ActivityIndicator />
      </S.Container>
    );
  }

  const qrCode = (
    <S.ScanCode>
      <HereQRCode value={link} />
      <H2>Approve with QR</H2>
      <Text>Scan this code with your phone's camera to sign.</Text>
    </S.ScanCode>
  );

  return (
    <S.Page>
      <S.Wrap>
        <S.Card isLoading={result?.status === HereProviderStatus.APPROVING}>
          {result?.status === HereProviderStatus.APPROVING && <ActivityIndicator />}
          <Connector request={request} />

          {!isMobile() && window.innerWidth >= 800 && qrCode}
        </S.Card>

        {!isMobile() && window.innerWidth < 800 && (
          <S.Card style={{ marginTop: 0 }} isLoading={result?.status === HereProviderStatus.APPROVING}>
            {result?.status === HereProviderStatus.APPROVING && <ActivityIndicator />}
            {qrCode}
          </S.Card>
        )}

        {isMobile() && (
          <ActionButton as="a" href={link} style={{ marginBottom: 32, marginTop: -8, borderRadius: 16 }}>
            Tap to approve in HERE
          </ActionButton>
        )}
      </S.Wrap>
      <Footer />
    </S.Page>
  );
};

export default TransactionCard;
