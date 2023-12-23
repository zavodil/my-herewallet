import styled from "styled-components";

export const Root = styled.div`
  width: 100%;
  padding: 0 120px;
  margin: auto;
  min-height: calc(var(--vh, 1vh) * 100);
  background-color: var(--Elevation-0);
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    padding: 0 32px;
  }
`;

export const Header = styled.header`
  width: 100%;
  grid-area: header;
  flex-direction: row;
  background-color: var(--Elevation-0);
  justify-content: space-between;
  align-items: center;
  display: flex;
  height: 100px;
`;

export const Page = styled.div`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  padding: 200px 0;
  width: 100%;
  gap: 120px;
  flex: 1;

  @media (max-width: 1200px) {
    gap: 80px;
  }

  @media (max-width: 1024px) {
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    padding: 32px 0;
    gap: 42px;
  }
`;

export const IntroImage = styled.div`
  position: relative;

  img {
    max-width: 500px;
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

  @media (max-width: 1024px) {
    max-width: 450px;
  }
`;

export const Card = styled.div`
  background: var(--Elevation-0, #ebdedc);
  flex-direction: column;
  display: flex;
  gap: 56px;

  @media (max-width: 1024px) {
    gap: 24px;
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
