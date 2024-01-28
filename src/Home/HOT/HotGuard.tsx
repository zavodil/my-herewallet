import React from "react";
import { Root } from "../styled";
import { H2, H4 } from "../../uikit";
import { isTgProd } from "../../Mobile";
import { useNavigateBack } from "../../useNavigateBack";

const HotGuard = ({ Comp }: { Comp: any }) => {
  useNavigateBack();

  if (isTgProd()) {
    return (
      <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
        <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
        <H2 style={{ marginTop: 16 }}>HOT Coin</H2>
        <H4 style={{ marginTop: -4 }}>launches on January 31st.</H4>
      </Root>
    );
  }

  return <Comp />;
};

export default HotGuard;
