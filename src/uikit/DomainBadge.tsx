import styled from "styled-components";
import { ReactComponent as GlobalIcon } from "../assets/icons/global.svg";

export const SDomainBadge = styled.div`
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

export const DomainBadge = () => {
  const from = document.referrer ? new URL(document.referrer).hostname : "Unknown";

  return (
    <SDomainBadge>
      <GlobalIcon />
      <span>{from}</span>
    </SDomainBadge>
  );
};
