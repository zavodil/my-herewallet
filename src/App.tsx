import styled from "styled-components";
import TransactionCard from "./TransactionCard";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;
`;

function App() {
  return (
    <Page>
      <TransactionCard />
    </Page>
  );
}

export default App;
