import styled from "styled-components";
import TransactionCard from "./TransactionCard";
import { Loading } from "./uikit";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 24px 0 16px;
  box-sizing: border-box;
  height: 100vh;
  width: 100%;
`;

function App() {
  if (window.location.pathname === "/loading") {
    return (
      <Page style={{ justifyContent: "center", alignItems: "center", padding: "16px" }}>
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
