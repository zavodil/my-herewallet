import styled from "styled-components";
import { Button } from "../uikit";

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
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

export const PermissionsBadge = styled.div`
  margin-top: 40px;

  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  gap: 6px;

  width: fit-content;
  background: #359c2c;
  border-radius: 12px;

  @media (max-width: 800px) {
    margin-top: 16px;
  }

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

export const Badge = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;

  background: #d9cdcb;
  border-radius: 12px;

  font-family: "Manrope";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  color: #6b6661;
`;

export const Flexbox = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;

  flex-wrap: wrap;
  align-items: center;
`