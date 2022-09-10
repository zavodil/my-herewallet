import styled from "styled-components";
import { Button } from "../../uikit";

export const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;

  ${Button} {
    position: absolute;
    left: 0;
    top: 3px;
  }
`;

export const PermissionsList = styled.ul`
  padding: 0;
  margin-top: 54px;
  list-style-type: none;

  @media (max-width: 800px) {
    margin-top: 32px;
  }
`;

export const PermissionItem = styled.li`
  font-family: "Manrope";
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 25px;
  color: #2c3034;
  margin-top: 20px;

  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    flex-shrink: 0;
  }
`;
