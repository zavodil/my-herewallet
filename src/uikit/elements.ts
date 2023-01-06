import styled from "styled-components";


export const ActionButton = styled.button`
  color: #fff;
  border: none;
  text-decoration: none;
  align-items: center;
  justify-content: center;
  background: #2c3034;
  flex-shrink: 0;
  width: 100%;
  height: 56px;
  cursor: pointer;

  font-family: "Manrope";
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  width: calc(100% + 8px);

  display: flex;
  font-weight: bolder;
  border-radius: 16px;
  margin-bottom: 32px;
  margin-top: -8px;
`;

export const Button = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
`;

export const H2 = styled.h2`
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 900;
  font-size: 32px;
  line-height: 40px;
  color: #2c3034;
  margin: 0;

  @media (max-width: 800px) {
    font-size: 28px;
    line-height: 30px;
  }
`;

export const H3 = styled.h3`
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 30px;
  color: #2c3034;
  margin: 0;
`;

export const H4 = styled.h4`
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 800;
  font-size: 20px;
  line-height: 25px;
  color: #6b6661;
  margin: 0;
`;

export const Text = styled.p`
  font-family: "Manrope";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #2c3034;
  margin: 0;

  @media (max-width: 800px) {
    line-height: 20px;
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

  @media (max-width: 800px) {
    line-height: 20px;
  }
`;

export const H1 = styled.h1`
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 900;
  font-size: 40px;
  line-height: 50px;
  color: #2c3034;
  margin: 0;

  @media (max-width: 800px) {
    font-size: 32px;
    line-height: 32px;
  }
`;

export const H0 = styled.h1`
  font-family: "CabinetGrotesk";
  font-style: normal;
  font-weight: 900;
  font-size: 64px;
  line-height: 79px;
  color: #2c3034;
  margin: 0;

  @media (max-width: 800px) {
    font-size: 48px;
    line-height: 62px;
  }
`;
