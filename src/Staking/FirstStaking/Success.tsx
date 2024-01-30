import React from "react";
import { useNavigate } from "react-router-dom";

import cloudImage from "../../assets/cloud.png";
import { useWallet } from "../../core/Accounts";
import { DEFAULT_APY } from "../../core/constants";
import { ActionButton, H2, Text } from "../../uikit";
import { Formatter } from "../../core/helpers";
import { FullCardView } from "../styled";
import { observer } from "mobx-react-lite";

const SuccessStaking = () => {
  const user = useWallet()!;
  const navigate = useNavigate();

  return (
    <FullCardView>
      <img style={{ width: 164, height: 203, marginTop: "auto" }} src={cloudImage} />
      <H2 style={{ textAlign: "center", marginTop: 40 }}>All set</H2>
      <Text style={{ textAlign: "center", marginTop: 16, marginBottom: 54 }}>
        Congratulations! Now you will receive a passive income at a rate of {Formatter.round(user.near.hnear.apy ?? DEFAULT_APY * 100)}% APY. Income is accrued every day on the current balance.
      </Text>
      <ActionButton $id="FirstStakeSuccess.back" style={{ marginTop: "auto" }} onClick={() => navigate("/stake", { replace: true })}>
        Open dashboard
      </ActionButton>
    </FullCardView>
  );
};

export default observer(SuccessStaking);
