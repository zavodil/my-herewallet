import React from "react";
import { ActionButton, H1, H2, Text } from "../uikit";
import Footer from "./Footer";
import * as S from "./styled";
import { isMobile } from "@here-wallet/core";
import HereQRCode from "../uikit/HereQRCode";

const OpenInApp = () => {
  const link = window.location.href
    .replace(window.location.origin, "herewallet:/")
    .replace(window.location.origin, "herewallet:/");

  return (
    <S.Page>
      <S.Wrap style={{ padding: 32 }}>
        <H1>Hello friend!</H1>

        {isMobile() ? (
          <>
            <Text style={{ fontSize: 20, textAlign: "center" }}>
              To perform this action, you have to go to the application.
            </Text>
            <ActionButton as="a" href={link} style={{ borderRadius: 16, marginTop: 32 }}>
              Tap to open in HERE
            </ActionButton>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 20, marginBottom: 32, textAlign: "center" }}>
              To perform this action, you have to scan this QR code
            </Text>
            <HereQRCode value={link} />
          </>
        )}
      </S.Wrap>
      <Footer />
    </S.Page>
  );
};

export default OpenInApp;
