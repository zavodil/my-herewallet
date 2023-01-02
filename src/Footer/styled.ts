import styled from "styled-components";

export const Footer = styled.footer`
  display: flex;
  align-items: flex-end;
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

export const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 68px;
  margin-left: 8px;
  width: calc(100% + 8px);
  gap: 8px;

  @media (max-width: 800px) {
    margin-top: 32px;
  }

  a {
    display: flex;
  }
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

  @media (max-width: 800px) {
    width: 100%;
  }
`;

export const Button = styled.button`
  color: #fff;
  text-decoration: none;
  align-items: center;
  justify-content: center;
  background: #2c3034;
  display: flex;
  height: 46px;
  flex-shrink: 0;
  flex: 1;

  font-weight: bolder;
  border-radius: 8px;
  width: 160px;
`;