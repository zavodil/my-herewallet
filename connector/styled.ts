import styled from "styled-components";

export const Button = styled.button<{ $active?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${(p) => (p.$active ? "#E7DFDE" : "")};

  transition: 0.2s opacity;
  &:hover {
    opacity: 0.6;
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
`;

export const SmallText = styled.p`
  font-family: "Manrope";
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  color: #6b6661;
  margin: 0;
`;

export const TinyText = styled(SmallText)`
  font-size: 12px;
  line-height: 12px;
`;

export const H4 = styled.h4`
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 800;
  font-size: 20px;
  line-height: 25px;
  color: #2c3034;
  margin: 0;
`;

export const Text = styled.p`
  font-family: "Manrope";
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: #2c3034;
  margin: 0;
  text-decoration: none;
`;

export const LedgerWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 420px;
  margin: auto;
  flex: 1;

  img {
    width: 206px;
    height: 206px;
    position: relative;
  }

  h2 {
    color: #2c3034;
    font-size: 20px;
    font-style: normal;
    font-weight: 900;
    line-height: 20px;
    font-family: "CabinetGrotesk";
    margin: 0;
    margin-top: 32px;
    text-align: center;
  }

  p {
    color: var(--Black-Secondary, #6b6661);
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    font-family: "Manrope";
    margin: 0;
    margin-top: 8px;
    text-align: center;
  }
`;

export const LedgerBlur1 = styled.div<{ $green?: boolean }>`
  position: absolute;
  width: 108px;
  height: 108px;
  background: ${(p) => (p.$green ? "#43D16B" : "linear-gradient(0deg, #fdd65f 0%, #fca857 37.33%, #fc668b 70.66%, #c74ad5 100%)")};
  filter: blur(23px);
  opacity: 0.3;
  left: 0;
  bottom: 0;
`;

export const LedgerBlur2 = styled.div<{ $green?: boolean }>`
  position: absolute;
  width: 108px;
  height: 108px;
  background: ${(p) => (p.$green ? "#43D16B" : "linear-gradient(0deg, #c74ad5 0%, #fc668b 32.29%, #fca857 65.1%, #fdd65f 100%)")};
  opacity: 0.3;
  filter: blur(23px);
  top: 0;
  right: 0;
`;

export const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 336px;

  a {
    flex: 1;
    max-height: 48px;
    background: #100f0d;
    border-radius: 12px;
    padding: 4px;
    transition: 0.2s opacity;
    text-decoration: none !important;
  }

  a:hover {
    opacity: 0.7;
  }

  img {
    width: 100%;
  }
`;

export const Footer = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;

  a {
    display: inline-flex;
    text-decoration: none;
  }

  p {
    text-align: center;
    margin-bottom: 0;
  }

  & > img {
    position: absolute;
    height: 180px;
    bottom: 0;
    right: 32px;
  }

  & > img:first-child {
    left: 32px;
  }

  @media (max-width: 620px) {
    & > img {
      display: none;
    }
  }
`;

export const ApproveButton = styled.div`
  border: none;
  outline: 0;
  padding: 0;
  margin: 0 auto 16px;
  cursor: pointer;

  font-size: 1em;
  font-weight: bolder;
  flex-shrink: 0;
  width: 100%;
  height: 48px;
  max-width: 336px;
  border-radius: 12px;

  transition: 0.2s opacity;
  background: #2c3034;
  color: #fff;

  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }

  &.disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

export const CloseButton = styled.div`
  position: absolute;
  top: 32px;
  right: 32px;
  height: 32px;
  width: 32px;
  padding: 0;

  font-family: "Manrope";
  font-style: normal;
  font-weight: bolder;
  font-size: 16px;
  color: #2c3034;

  border: none;
  margin: 0;
  outline: none;
  cursor: pointer;
  height: 32px;
  background-color: #ebdedc;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  display: flex;

  transition: 0.2s opacity;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 640px) {
    right: 16px;
    top: 16px;
  }
`;

export const HereModal = styled.div`
  a {
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
    text-decoration-line: underline;
    color: #fd84e3;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;

  position: relative;
  width: 100%;
  height: 100%;
  padding: 62px 32px 32px;
  gap: 32px;

  background: #f3ebea;
  font-size: 16px;
  line-height: 1.6;

  max-width: 720px;
  max-height: 520px;
  border-radius: 24px;
  border: 1px solid #2c3034;

  @media (max-width: 640px) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding-top: 82px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

export const SwitchersWrap = styled.div`
  display: flex;
  gap: 16px;
  position: absolute;
  top: 28px;
  left: 28px;
`;

export const ButtonSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #c7bab8;
  cursor: pointer;
  border-radius: 24px;
  padding: 8px 12px;
  width: fit-content;

  &:hover {
    background-color: #ebdedc;
  }
`;

export const ConnectorWrap = styled.div`
  max-width: 480px;
  width: 100%;
  margin: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: -24px;
`;
