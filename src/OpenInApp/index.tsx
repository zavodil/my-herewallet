import React from "react";
import { ActionButton, H1, H2, Text } from "../uikit";
import Footer from "./Footer";
import { isMobile } from "is-mobile";
import HereQRCode from "../uikit/HereQRCode";
import * as S from "./styled";

const OpenInApp = () => {
  const link = window.location.href
    .replace(window.location.origin, "herewallet:/")
    .replace(window.location.origin, "herewallet:/");

  if (window.location.pathname === "/command/delete") {
    return (
      <S.Page>
        <S.Wrap style={{ padding: 32 }}>
          <H1 style={{ textAlign: "center", lineHeight: 0.9, marginBottom: 16 }}>Delete HERE account?</H1>

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

          <div style={{ maxWidth: 500, marginTop: 16, textAlign: "center" }}>
            <Text style={{}}>
              1. HERE account will be deleted - score, achievements, friends, contacts and other personal data will be
              deleted immediately
            </Text>
            <Text style={{ marginTop: 8 }}>2. You will retain access to your tokens and NFTs via a seed phrase</Text>
          </div>
        </S.Wrap>
        <Footer />
      </S.Page>
    );
  }

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
