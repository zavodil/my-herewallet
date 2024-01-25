import styled, { css } from "styled-components";
import { Card } from "../Home/styled";
import { Button } from "../uikit";

export const AppsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 24px;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 48px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 920px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }

  img {
    border-radius: 40px;
    width: 136px;
    height: 136px;
  }

  ${Card} {
    transition: 0.2s border;
    &:hover {
      border: 1px solid var(--Black-Primary);
    }
  }
`;

export const Tab = styled(Button)<{ $active?: boolean }>`
  border-radius: 12px;
  background: var(--Elevation-1);
  border: 1px solid var(--Stroke);

  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  align-items: flex-start;
  transition: 0.2s border-color, 0.2s background;
  height: 40px;
  gap: 4px;

  p {
    margin: 0;
  }

  ${(p) =>
    p.$active &&
    css`
      background: #f3ebea;
      border-color: var(--border-high, #2c3034);
    `}

  &:hover {
    opacity: 1;
    border-color: var(--border-high, #2c3034);
  }
`;

export const SearchInput = styled.label`
  border: 1px solid var(--Black-Primary);
  background: var(--Elevation-1);
  border-radius: 16px;
  margin: 0;
  margin-left: auto;

  display: flex;
  width: 285px;
  height: 44px;
  padding: 10px 201px 10px 12px;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  input {
    margin: 0;
    outline: none;
    background: transparent;
    border: none;
    flex: 1;

    color: var(--Black-Primary, #2c3034);
    font-family: Manrope;
    font-size: 16px;
    font-style: normal;
    font-weight: bold;
    line-height: 20px;
  }
`;
