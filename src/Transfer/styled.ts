import styled from "styled-components";
import { Button } from "../uikit";
import { Card } from "../Home/styled";

export const Container = styled.div`
  padding: 40px 120px;
  display: grid;
  width: 100%;
  grid-gap: 20px;

  grid-template-columns: 590px 380px;
  grid-template-areas:
    "navigation navigation"
    "recipient contacts"
    "asset contacts"
    "amount contacts";

  @media (max-width: 920px) {
    display: flex;
    flex-direction: column;
    padding: 16px;
  }
`;

export const ContainerSuccess = styled(Container)`
  padding-top: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 640px) {
    height: 100%;
    background-color: var(--Elevation-0);
    justify-content: center;
    padding-top: 0;
    padding: 24px;
  }
`;

export const CardSuccess = styled(Card)`
  flex-direction: row;
  max-width: 700px;
  width: 100%;
  padding: 64px 48px;
  gap: 48px;

  @media (max-width: 640px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: none;
    height: fit-content;
    padding: 0;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 860px;
`;

export const InputButton = styled(Button)<{ $active?: boolean }>`
  border-radius: 20px;
  border: ${(p) => (p.$active ? "1px solid var(--Black-Primary)" : "1px solid var(--Stroke)")};
  display: flex;
  width: 56px;
  height: 36px;
  padding: 4px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  transition: 0.2s border-color;

  &:hover {
    border-color: var(--Black-Secondary);
    color: var(--Black-Primary);
    opacity: 1;
  }

  * {
    font-weight: bold;
    color: ${(p) => (p.$active ? "var(--Black-Primary)" : "var(--Black-Secondary)")};
  }
`;

export const TokenOption = styled(Button)`
  width: 100%;
  gap: 12px;
  justify-content: flex-start;
  align-items: center;
`;
