import styled from "styled-components";
import { Button } from "../uikit";

export const Root = styled.div`
  width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Container = styled.div`
  justify-content: center;
  display: flex;
  width: 100%;
  padding: 24px 120px;
  max-width: 1600px;
  margin: 0 auto;
  gap: 20px;

  @media (max-width: 1200px) {
    padding: 24px 32px;
  }

  @media (max-width: 960px) {
    flex-direction: column;
    padding: 16px;
  }
`;

export const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  gap: 20px;

  @media (max-width: 960px) {
    flex-direction: row;
    width: 100%;
  }
`;

export const Card = styled.div`
  background: var(--Elevation-0, #ebdedc);
  border: 1px solid var(--Stroke, #c7bab8);
  flex-direction: column;
  border-radius: 24px;
  display: flex;
  gap: 16;
  padding: 24px;

  @media (max-width: 960px) {
    padding: 16px;
  }
`;

export const Tabs = styled.div`
  display: flex;
  border-radius: 12px;
  border: 1px solid var(--Stroke);
  padding: 4px;
  height: 40px;
  width: 100%;
  gap: 4px;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  border-radius: 10px;
  outline: none;
  border: none;
  cursor: pointer;
  text-align: center;
  flex: 1;

  font-weight: 600;
  font-style: normal;
  font-size: 16px;
  line-height: 22px;
  color: #2c3034;
  transition: 0.2s all;

  color: ${(p) => (p.$active ? "var(--Black-Primary)" : "var(--Black-Secondary)")};
  background: ${(p) => (p.$active ? "var(--Elevation-1)" : "var(--Elevation-0)")};

  &:hover {
    opacity: 0.7;
    background: var(--Elevation-1);
    color: var(--Black-Primary);
  }
`;

export const TokensRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr;
  border-bottom: 1px solid var(--Stroke);
  padding-bottom: 12px;
  padding-top: 24px;
`;

export const TokenCard = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr;
  padding-bottom: 20px;
  padding-top: 20px;
  grid-gap: 8px;

  > * {
    overflow: hidden;
  }

  & + & {
    border-top: 1px solid var(--Stroke);
  }
`;

export const TokenAction = styled.button`
  border-radius: 8px;
  border: 1px solid var(--Stroke, #c7bab8);
  background: var(--Elevation-1, #ebdedc);
  display: flex;
  padding: 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 40px;
  height: 40px;
  outline: none;
  cursor: pointer;
`;

export const TokenIcon = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 12px;
`;

export const ButtonCard = styled.button`
  outline: none;
  border: 1px solid var(--Stroke);
  border-radius: 12px;
  background-color: var(--Elevation-0);
  display: flex;
  align-items: center;
  height: 80px;
  padding: 0 24px;
  width: 100%;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  transition: 0.5s box-shadow;

  &:hover {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }
`;

export const NftCard = styled.img`
  width: 100%;
  aspect-ratio: 1/ 1;
  border: 1px solid #2c3034;
  border-radius: 12px;
  object-fit: cover;
  background-color: var(--Elevation-1);

  cursor: pointer;
  transition: 0.2s box-shadow;

  &:hover {
    box-shadow: 4px 4px 0px 0px #2c3034;
  }
`;

export const NftsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 24px;
`;

export const AppIcon = styled.img`
  border-radius: 12px;
  border: 1px solid var(--Stroke, #c7bab8);
  background: var(--Elevation-1, #ebdedc);
  width: 40px;
  height: 40px;
`;

export const RecentlyApp = styled(Button)`
  align-items: center;
  display: flex;
  cursor: pointer;
  gap: 12px;
  padding-top: 12px;

  & + & {
    border-top: 1px solid #d9cdcb;
    margin-top: 12px;
  }
`;

export const WarningBadge = styled.div`
  display: flex;
  border-radius: 8px;
  border: 1px solid #db8520;
  display: flex;
  padding: 0 4px;
  justify-content: center;
  height: 26px;
  align-items: center;
  gap: 4px;
  background: #f1e1d6;
`;
