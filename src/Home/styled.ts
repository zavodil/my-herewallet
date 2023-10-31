import styled, { createGlobalStyle } from "styled-components";

export const Page = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 24px;
  box-sizing: border-box;
  min-height: calc(var(--vh, 1vh) * 100);
  width: 100%;
  grid-gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const Box = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

export const Container = styled.div`
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
`;

export const Card = styled.div`
  background: var(--Elevation-0, #ebdedc);
  border: 1px solid var(--Stroke, #c7bab8);
  border-radius: 24px;
  padding: 24px;
`;

export const CardIntro = styled(Card)`
  background: var(--Elevation-1, #ebdedc);
  border: 1px solid var(--Stroke, #c7bab8);
`;

export const Header = styled.header`
  width: 100%;
  grid-area: header;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  display: flex;
`;

export const Root = styled.div`
  display: grid;
  grid-gap: 24px;
  grid-template-areas: "header header" "balance transactions" "tokens transactions";
  grid-template-rows: min-content min-content 1fr;
  grid-template-columns: min-content;

  background: var(--Elevation-1, #ebdedc);
  height: calc(var(--vh, 1vh) * 100);
  box-sizing: border-box;
  max-width: 1024px;
  padding: 24px;
  margin: auto;
  flex: 1;

  @media (max-width: 900px) {
    grid-template-areas: "header" "balance" "tokens" "transactions";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    height: auto;
  }
`;

export const TokensCard = styled(Card)`
  grid-area: tokens;
  overflow-y: auto;
  width: 420px;
  height: 100%;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

export const BalanceCard = styled(Card)`
  grid-area: balance;
  display: flex;
  height: 108px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12;
  margin-top: 12;
  gap: 16;
`;

export const TokenCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 20px;

  & + & {
    border-top: 1px solid var(--Stroke);
  }
`;

export const HomeGlobalStyle = createGlobalStyle`
  html, body {
    background: var(--Elevation-1, #ebdedc);
  }
`;
