import styled from "styled-components";
import { Button } from "../uikit";

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
