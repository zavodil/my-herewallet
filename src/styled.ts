import styled from "styled-components";
import { Button, H2, Text } from "./uikit";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;
`;

export const Card = styled.div`
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
`;

export const MoreInformation = styled.div`
  ${Button} {
    font-family: "Manrope";
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    text-decoration-line: underline;
    color: #fd84e3;
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

export const SignInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const PermissionsBadge = styled.div`
  margin-top: 40px;

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  gap: 6px;

  width: fit-content;
  background: #359c2c;
  border-radius: 12px;

  span,
  button {
    font-family: "Manrope";
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
    color: #f3ebea;
  }

  button {
    text-decoration-line: underline;
  }
`;

export const DomainBadge = styled.div`
  margin-bottom: 18px;

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 16px;
  gap: 8px;

  background: #fdbf1e;
  border-radius: 12px;
  width: fit-content;

  font-family: "Manrope";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  color: #2c3034;

  img {
    width: 24px;
    height: 24px;
  }
`;
