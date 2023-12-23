import styled from "styled-components";
import { Button } from "../../uikit";

export const Divider = styled.div`
  background: #d9cdcb;
  height: 2px;
  width: 100%;
  margin-top: 32px;
  margin-bottom: 32px;
`;

export const Flex = styled.div`
  display: flex;
  align-items: flex-end;
  overflow: hidden;
`;

export const InputCard = styled.div`
  background: var(--Elevation-1);
  border: 1px solid #2c3034;
  border-radius: 16px;
  width: 100%;
  padding: 16px;
  padding-bottom: 12px;
  gap: 12px;
  display: flex;
  flex-direction: column;
`;

export const EditButton = styled(Button)`
  font-family: "Manrope";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  color: #2c3034;
`;

export const AmountInput = styled.input`
  appearance: none;
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 900;
  font-size: 32px;
  line-height: 40px;
  color: #2c3034;
  margin: 0;
  border: none;
  outline: none;
  background: transparent;
  align-self: flex-start;
  padding: 0;
`;
