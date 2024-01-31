import React from "react";
import { Root } from "../styled";
import { H2, H4 } from "../../uikit";
import { useNavigateBack } from "../../useNavigateBack";
import { accounts, useWallet } from "../../core/Accounts";
import { SmallText } from "../../uikit/typographic";
import { truncateAddress } from "../../core/helpers";

const HotGuard = ({ Comp }: { Comp: any }) => {
  const user = useWallet()!;
  useNavigateBack();

  // if (isTgProd()) {
  //   return (
  //     <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
  //       <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
  //       <H2 style={{ marginTop: 16 }}>HOT</H2>
  //       <H4 style={{ marginTop: -4 }}>launches on January 31st.</H4>
  //     </Root>
  //   );
  // }

  if (accounts.telegramAccountId && accounts.telegramAccountId !== user.near.accountId) {
    return (
      <Root style={{ justifyContent: "center", textAlign: "center", alignItems: "center", padding: 24 }}>
        <img style={{ width: 80 }} src={require("../../assets/hot/hot.png")} />
        <H2 style={{ marginTop: 16 }}>HOT</H2>
        <H4 style={{ marginTop: -4 }}>You're already mining 🤨</H4>
        <SmallText>{truncateAddress(accounts.telegramAccountId)}</SmallText>
      </Root>
    );
  }

  return <Comp />;
};

export default HotGuard;
