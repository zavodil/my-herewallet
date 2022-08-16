import styled from "styled-components";
import { Button } from "../uikit";

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
