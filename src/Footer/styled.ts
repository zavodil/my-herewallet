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
`;
