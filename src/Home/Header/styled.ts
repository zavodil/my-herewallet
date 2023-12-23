import styled from "styled-components";
import { Button } from "../../uikit";

export const Header = styled.header`
  width: 100%;
  grid-area: header;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  display: flex;
  background-color: var(--Elevation-0);
  height: 68px;
  position: relative;

  .header-right {
    position: absolute;
    right: 120px;
  }

  .header-left {
    position: absolute;
    left: 120px;
  }

  @media (max-width: 1200px) {
    justify-content: flex-start;
    padding: 0 32px;

    .header-left {
      display: none;
    }

    .header-right {
      right: 32px;
    }
  }
`;

export const NavBar = styled.div`
  display: flex;
  gap: 50px;

  @media (max-width: 1200px) {
    gap: 24px;
  }
`;

export const NavButton = styled.button<{ $active?: boolean }>`
  outline: none;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  border: none;
  height: 68px;

  background-color: var(--Elevation-0);
  color: ${(p) => (p.$active ? "var(--Black-Primary)" : "var(--Black-Secondary)")};
  border-bottom: ${(p) => (p.$active ? "2px solid var(--Black-Primary)" : "")};

  transition: 0.2s color, 0.2s border-bottom;
  cursor: pointer;

  &:hover {
    color: var(--Black-Primary);
    border-bottom: 2px solid var(--Black-Secondary);
  }
`;

export const AvatarImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--Black-Primary, #2c3034);
  background-color: #fff;
  padding: 0;
  appearance: none;
  object-fit: cover;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const AccountButton = styled(Button)`
  padding: 4px;
  border-radius: 8px;
  align-items: center;
  padding: 8px;
  width: 248px;
  height: 48px;

  &:hover {
    opacity: 1;
    background-color: var(--Elevation-1);
  }
`;

export const AccountMenu = styled.div`
  border-radius: 24px;
  border: 1px solid var(--Stroke, #c7bab8);
  background: var(--Elevation-0, #f3ebea);
  box-shadow: 0px 16px 40px 0px rgba(44, 48, 52, 0.1);
  position: absolute;
  padding: 16px;

  z-index: 100000;
  top: 52px;
  right: -4px;
`;
