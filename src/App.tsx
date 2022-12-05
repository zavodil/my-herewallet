import styled from "styled-components";
import TransactionCard from "./TransactionCard";

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
  return (
    <Page>
      <TransactionCard />
    </Page>
  );
}

export default App;
