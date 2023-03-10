import styled from "styled-components";
import { Text } from "../uikit";

export const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  min-height: calc(var(--vh, 1vh) * 100);
  background: #f3ebea;
  width: 100%;
  position: fixed;

  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: fixed;
    background-image: url(${new URL("../assets/stake-bg.svg", import.meta.url).href});
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 0.3;
    z-index: -1;
  }

  @media (max-width: 576px) {
    position: relative;
  }
`;

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const CardView = styled.div`
  height: 560px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #ebdedc;

  @media (max-width: 576px) {
    width: 100vw;
    height: 100%;
    border: none;
    box-shadow: none;
    background: #f3ebea;
    padding: 0 24px;
  }
`;

export const FullCardView = styled(CardView)`
  @media (max-width: 576px) {
    height: calc(var(--vh, 1vh) * 100 - 56px);
    padding: 24px;
  }
`;

export const DashboardScroll = styled.div`
  overflow-y: scroll;
  width: 100%;
  padding-bottom: 16px;
  border-top: 1px solid #d9cdcb;
  @media (max-width: 576px) {
    padding-bottom: 116px;
    margin-bottom: auto;
  }
`;

export const Card = styled.div`
  position: relative;
  background: #ebdedc;
  border: 1px solid #2c3034;
  box-shadow: 8px 8px 0px #2c3034;
  border-radius: 16px;
  overflow: hidden;

  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: flex;
  height: 560px;
  width: 400px;

  @media (max-width: 576px) {
    width: 100vw;
    height: 100%;
    border: none;
    box-shadow: none;
    background: #f3ebea;
  }
`;

export const OtterSecText = styled(Text)`
  margin-top: 48px;
  font-weight: bolder;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  display: flex;
  gap: 16px;

  transition: 0.2s opacity;
  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 576px) {
    display: none;
  }
`;

export const OnboardSecText = styled(OtterSecText)`
  display: none;
  @media (max-width: 576px) {
    display: flex;
    margin-top: 16px;
    gap: 8px;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  margin-bottom: 24px;
`;
