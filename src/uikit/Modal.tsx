import styled from "styled-components";
import { colors } from "./theme";

export const Modal = styled.div<{ isShow: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${colors.elevation1};
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1000;

  transition: 0.2s transform;
  transform: translateY(${(p) => (p.isShow ? "0" : "100%")});
`;
