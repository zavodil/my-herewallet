import styled from "styled-components";

export const Root = styled.div`
  width: 100%;
  margin: auto;
  background-color: var(--Elevation-1);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
  padding: 24px 16px;
  height: var(--tg-viewport-height);
`;

export const Page = styled.div`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  padding: 48px 120px;
  padding-left: 60px;
  align-items: center;
  width: 100%;
  gap: 120px;
  flex: 1;

  @media (max-width: 1200px) {
    gap: 80px;
    padding-left: 0;
    padding-right: 48px;
  }

  @media (max-width: 1024px) {
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    padding-left: 32px;
    padding-right: 32px;
    gap: 42px;
  }
`;

export const IntroImage = styled.div`
  height: fit-content;
  position: relative;
  max-width: 285px;
  width: 100%;

  img {
    width: 100%;
    object-fit: contain;
    position: relative;
  }

  img:first-child {
    position: absolute;
    top: 40px;
    opacity: 0.6;
    filter: blur(20px);
  }
`;

export const Card = styled.div`
  background: var(--Elevation-0, #ebdedc);
  border: 1px solid var(--Stroke);
  padding: 32px;
  border-radius: 24px;
  flex-direction: column;
  display: flex;
  gap: 24px;
  cursor: pointer;
  transition: 0.2s border-color;
  @media (max-width: 1024px) {
    gap: 24px;
  }

  &:hover {
    border-color: var(--Black-Primary);
  }
`;

export const ButtonCard = styled.button`
  outline: none;
  border: 1px solid var(--Stroke, #c7bab8);
  border-radius: 12px;
  background-color: var(--Elevation-0, #ebdedc);
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

export const WordItem = styled.div`
  border-radius: 20px;
  border: 1px solid var(--Stroke, #c7bab8);
  background: var(--Elevation-1, #ebdedc);
  display: flex;
  width: 108px;
  height: 40px;
  padding: 10px;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;

  color: var(--Black-Primary, #2c3034);
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;

  span:first-child {
    color: var(--Black-Secondary);
    font-size: 13px;
  }

  span:last-child {
    margin: auto;
    margin-top: -2px;
  }
`;

export const WordsWrap = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 344px;
`;
