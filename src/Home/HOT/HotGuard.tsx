import React from "react";
import { Root } from "../styled";
import { H2, H4 } from "../../uikit";
import { isTgProd } from "../../env";
import { useNavigateBack } from "../../useNavigateBack";
import { useWallet } from "../../core/Accounts";
import { SmallText } from "../../uikit/typographic";

const HotGuard = ({ Comp }: { Comp: any }) => {
  const user = useWallet()!;
  useNavigateBack();

  if (isTgProd()) {
    return (
      <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
        <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
        <H2 style={{ marginTop: 16 }}>HOT</H2>
        <H4 style={{ marginTop: -4 }}>launches on January 31st.</H4>
      </Root>
    );
  }

  if (user.telegramAccountId && user.telegramAccountId !== user.near.accountId) {
    return (
      <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
        <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
        <H2 style={{ marginTop: 16 }}>HOT</H2>
        <H4 style={{ marginTop: -4 }}>You're already mining 🤨</H4>
        <SmallText>{user.telegramAccountId}</SmallText>
      </Root>
    );
  }

  return <Comp />;
};

export default HotGuard;
