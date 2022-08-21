import styled, { css } from "styled-components";
import { Loading } from "../uikit/Loading";
import { H2, Text } from "../uikit/elements";

export const Card = styled.div<{ isLoading?: boolean }>`
  position: relative;
  background: #ebdedc;
  border: 1px solid #2c3034;
  box-shadow: 8px 8px 0px #2c3034;
  border-radius: 16px;

  width: 794px;
  margin: 100px auto 0;
  padding: 40px 50px;
  min-height: 428px;

  display: flex;
  justify-content: space-between;

  ${(p) =>
    p.isLoading &&
    css`
      &::after {
        content: "";
        top: 0;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(235, 222, 220, 0.8);
        border-radius: 15px;
      }
    `}

  ${Loading} {
    position: absolute;
    z-index: 10;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -40px;
  }
`;

export const ScanCode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  ${H2} {
    margin-top: auto;
    margin-bottom: 16px;
  }

  ${Text} {
    width: 250px;
    text-align: center;
  }
`;
