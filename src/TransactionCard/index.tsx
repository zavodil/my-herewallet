import React, { useEffect, useState } from "react";
import { HereProviderStatus } from "@here-wallet/core";
import { View } from "react-native";

import { colors } from "../uikit/theme";
import { ActionButton, H2, H3, Loading, Text } from "../uikit";
import { Connector } from "../Connector";
import { isIOS } from "../utilts";
import Footer from "../Footer";

import { useSignRequest } from "./useSignRequest";
import HereQRCode from "./HereQRCode";
import * as S from "./styled";

const Nobr = (p: any) => <span {...p} style={{ whiteSpace: "nowrap" }} />;

const TransactionCard = () => {
  const { result, link, request } = useSignRequest();
  const [isMobile, setMobile] = useState(false);
  const [useAppclip, setAppclip] = useState(localStorage.getItem("disableAppClip") == null);

  const handleOpen = () => {
    window.location.assign(link);
  };

  useEffect(() => {
    if (useAppclip) localStorage.removeItem("disableAppClip");
    else localStorage.setItem("disableAppClip", "1");
  }, [useAppclip]);

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

  return (
    <>
      <S.Wrap>
        <View
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
        </View>

        <S.Card isLoading={result?.status === HereProviderStatus.APPROVING}>
          {result?.status === HereProviderStatus.APPROVING && <Loading />}
          <Connector request={request} />

          {isMobile === false && (
            <S.ScanCode>
              <HereQRCode useAppclip={useAppclip} value={link} />
              <H2>Approve with QR</H2>
              <Text>
                Scan this code with your phone's camera to sign.{" "}
                <span
                  onClick={() => setAppclip((v) => !v)}
                  style={{ color: colors.pink, cursor: "pointer" }}
                >
                  {useAppclip ? "Doesn't work?" : "Use AppClip"}
                </span>
              </Text>
            </S.ScanCode>
          )}
        </S.Card>

        {isIOS() === false && isMobile && (
          <S.Card>
            <S.ScanCode>
              <HereQRCode useAppclip={useAppclip} value={link} />
              <H2>Approve with QR</H2>
              <Text>
                Scan this code with your phone's
                <br />
                camera to sign.{" "}
                <span
                  onClick={() => setAppclip((v) => !v)}
                  style={{ color: colors.pink, cursor: "pointer" }}
                >
                  {useAppclip ? "Doesn't work?" : "Use AppClip"}
                </span>
              </Text>
            </S.ScanCode>
          </S.Card>
        )}

        {isMobile && isIOS() && <ActionButton onClick={handleOpen}>Tap to approve in HERE</ActionButton>}
      </S.Wrap>
      <Footer network={request.network ?? "mainnet"} />
    </>
  );
};

export default TransactionCard;
