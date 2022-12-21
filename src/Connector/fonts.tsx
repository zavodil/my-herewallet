import React from "react";
import { Text } from "react-native";
import styled from "styled-components/native";
import { colors, fonts } from "../uikit/theme";

export const H1 = styled.Text`
  font-family: "${fonts.headlineFont}";
  font-size: 40px;
  line-height: 50px;
  color: ${colors.blackPrimary};
`;

export const H2 = styled.Text`
  font-family: "${fonts.headlineFont}";
  font-size: 32px;
  line-height: 40px;
  color: ${colors.blackPrimary};
`;

export const H3 = styled.Text`
  font-family: "${fonts.headlineFont}";
  font-size: 24px;
  line-height: 30px;
  color: ${colors.blackPrimary};
`;

export const P = styled.Text`
  font-family: "${fonts.mainFont}";
  color: ${colors.blackPrimary};
  font-size: 16px;
  line-height: 25px;
`;

export const BoldP = styled(P)`
  font-family: "${fonts.mainFont}";
  color: ${colors.blackPrimary};
`;

export const ButtonLabel = styled.Text`
  font-family: "${fonts.mainFont}";
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: #ffffff;
`;

export const SmallP = styled.Text`
  font-family: "${fonts.mainFont}";
  font-size: 14px;
  line-height: 19px;
  color: ${colors.blackPrimary};
`;

export const SmallBoldP = styled(SmallP)`
  color: ${colors.blackPrimary};
`;

export const Dot = () => <Text style={{ color: colors.pink }}>.</Text>;
