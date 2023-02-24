import styled from "styled-components";
import { Button } from "../../uikit";

export const StakeButton = styled(Button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 64px;
  gap: 4px;
`;

export const AmountInputWrap = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

export const AmountField = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

export const SwitchButton = styled(Button)`
  background: #d9cdcb;
  border-radius: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0;
  top: 50%;
  margin-top: -16px;
`;

export const AmountInput = styled.input`
  appearance: none;
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 900;
  font-size: 48px;
  color: #2c3034;
  margin: 0;
  border: none;
  outline: none;
  background: transparent;
  width: 0;
  margin-top: -5px;
  padding: 0;
`;
