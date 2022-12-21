import React from "react";
import styled from "styled-components";
import TransactionCard from "./TransactionCard";
import { Loading } from "./uikit";

export const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0 24px 0 16px;
  box-sizing: border-box;
  min-height: 100vh;
  width: 100%;
`;

function App() {
  if (window.location.pathname === "/loading") {
    return (
      <Page style={{ padding: "16px", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Loading />
        <p style={{ fontSize: "22px", textAlign: "center" }}>
          Transaction in progress,
          <br />
          please do not close this page
        </p>
      </Page>
    );
  }

  return (
    <Page>
      <TransactionCard />
    </Page>
  );
}

export default App;
