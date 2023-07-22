import styled from "styled-components";

export const Footer = styled.footer`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  padding-bottom: 56px;
  position: relative;
  width: 100%;
  box-sizing: border-box;

  > img:first-child {
    width: 146px;
    height: 209px;
    position: absolute;
    left: 56px;
    bottom: 0;
  }

  > img:last-child {
    width: 138px;
    height: 198px;
    position: absolute;
    right: 56px;
    bottom: 0;
  }

  @media (max-width: 800px) {
    > img:first-child {
      display: none;
    }

    > img:last-child {
      display: none;
    }
  }
`;

export const Flexbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const Appstore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  p {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
    color: #6b6661;

    margin: 0;
    margin-top: 16px;
  }

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 800px) {
    width: 100%;
  }
`;
