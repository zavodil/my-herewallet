import styled from "styled-components";

export const Footer = styled.footer`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 56px;

  > img:first-child {
    width: 146px;
    height: 209px;
  }

  > img:last-child {
    width: 138px;
    height: 198px;
  }

  @media (max-width: 800px) {
    padding: 0 16px;
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
  width: 100%;
  gap: 8px;
`;

export const Appstore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;

  p {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
    color: #6b6661;

    margin: 0;
    margin-top: 26px;
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

  font-weight: bolder;
  border-radius: 8px;
  width: 160px;
`;