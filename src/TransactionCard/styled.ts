import styled, { css } from "styled-components";
import { Loading } from "../uikit/Loading";
import { H2, Text } from "../uikit/elements";

export const Container = styled.div`
  height: 100vh;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const Wrap = styled.div`
  flex: 1;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  padding-right: 20px;
`;

export const Card = styled.div<{ isLoading?: boolean }>`
  position: relative;
  background: #ebdedc;
  border: 1px solid #2c3034;
  box-shadow: 8px 8px 0px #2c3034;
  border-radius: 16px;

  width: 794px;
  margin: 0 0 28px 0;
  padding: 40px 50px;
  min-height: 428px;
  margin-top: 48px;
  gap: 48px;

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

  @media (max-width: 800px) {
    width: calc(100vw - 32px);
    padding: 16px 0;
    margin-top: 16px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    min-height: fit-content;
  }
`;

export const ScanCode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;

  ${H2} {
    margin-bottom: 16px;
    text-align: center;
  }

  ${Text} {
    width: 250px;
    text-align: center;
  }

  @media (max-width: 800px) {
    width: 100%;

    svg {
      width: 150px;
      height: 150px;
    }

    ${H2} {
      margin-top: 8px;
      margin-bottom: 0;
    }

    ${Text} {
      width: 100%;
    }
  }
`;
