import React from "react";
import styled from "styled-components";
import { ActivityIndicator } from "../uikit/ActivityIndicator";

export const LoadingPage = () => {
  return (
    <Page style={{ padding: "16px", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <ActivityIndicator />
      <p style={{ fontSize: "22px", textAlign: "center" }}>
        Transaction in progress,
        <br />
        https://www.coingecko.com/en/api/documentation please do not close this page
      </p>
    </Page>
  );
};

const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  min-height: calc(var(--vh, 1vh) * 100);
  width: 100%;
`;
