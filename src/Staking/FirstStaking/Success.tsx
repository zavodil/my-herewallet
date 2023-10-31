import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import cloudImage from "../../assets/cloud.png";
import { useWallet } from "../../core/useWallet";
import { useAnalyticsTrack } from "../../core/analytics";
import { DEFAULT_APY } from "../../core/constants";
import { ActionButton, H2, Text } from "../../uikit";
import { Formatter } from "../../helpers";
import { FullCardView } from "../styled";

const SuccessStaking = () => {
  const { user } = useWallet();
  const navigate = useNavigate();

  const track = useAnalyticsTrack("first_stake");
  useEffect(() => {
    track("stake_success");
  }, []);

  return (
    <FullCardView>
      <img style={{ width: 164, height: 203, marginTop: "auto" }} src={cloudImage} />
      <H2 style={{ textAlign: "center", marginTop: 40 }}>All set</H2>
      <Text style={{ textAlign: "center", marginTop: 16, marginBottom: 54 }}>
        Congratulations! Now you will receive a passive income at a rate of{" "}
        {Formatter.round((user?.state.apy ?? DEFAULT_APY) * 100)}% APY. Income is accrued every day on
        the current balance.
      </Text>
      <ActionButton style={{ marginTop: "auto" }} onClick={() => navigate("/stake", { replace: true })}>
        Open dashboard
      </ActionButton>
    </FullCardView>
  );
};

export default SuccessStaking;
