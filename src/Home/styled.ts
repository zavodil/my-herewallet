import styled, { css } from "styled-components";
import { ActivityIndicator } from "../uikit/ActivityIndicator";
import { H2, Text } from "../uikit/typographic";

export const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  min-height: calc(var(--vh, 1vh) * 100);
  width: 100%;
`;

export const Container = styled.div`
  height: 100vh;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
