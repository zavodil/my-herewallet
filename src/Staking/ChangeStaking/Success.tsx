import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import rockImage from "../../assets/rock.png";
import { ActionButton, ActivityIndicator, H0, Text, Tooltip } from "../../uikit";
import { useAnalyticsTrack } from "../../core/analytics";
import { useWallet } from "../../core/useWallet";
import { formatAmount } from "../../helpers";
import { Formatter } from "../../helpers";
import { TipUnstake } from "../Tips";
import * as S from "../styled";

const SuccessStaking = ({
  defaultState,
  style,
}: {
  style?: any;
  defaultState?: { isStake: boolean; amount: number };
}) => {
  const navigate = useNavigate();
  const { user } = useWallet();
  const track = useAnalyticsTrack("edit");

  const [state, setState] = useState({ isStake: false, amount: 0 });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (user == null) return;
    if (defaultState != null) {
      setState(defaultState);
      setLoading(false);
    }

    const hash = new URL(window.location.href).searchParams.get("transactionHashes");
    if (hash == null) return;

    user.wallet.provider.txStatus(hash, user.wallet.accountId).then(({ transaction }) => {
      if (transaction.signer_id !== user.wallet.accountId) return;
      const call = transaction.actions[0]?.FunctionCall;
      if (call == null) return;

      if (call.method_name === "deposit") {
        track("stake_success");
        setState({ amount: formatAmount(call.deposit), isStake: true });
        setLoading(false);
        return;
      }

      if (call.method_name === "withdraw") {
        track("unstake_success");
        const args = JSON.parse(Buffer.from(call.args, "base64").toString("utf8"));
        setState({ amount: formatAmount(args.amount), isStake: false });
        setLoading(false);
        return;
      }
    });
  }, [user]);

  if (user == null) {
    return <Navigate to="/stake" replace />;
  }

  if (isLoading) {
    return (
      <S.CardView>
        <ActivityIndicator />
      </S.CardView>
    );
  }

  return (
    <S.CardView style={style}>
      <img style={{ width: 164, height: 235, marginTop: "auto" }} src={rockImage} />

      <Tooltip
        on={[]}
        children={<TipUnstake user={user} />}
        open={user.tips.tipUnstake && state.isStake === false}
        position={["right center", "bottom left"]}
        closeOnDocumentClick={false}
        closeOnEscape={false}
        lockScroll
        offsetX={10}
        trigger={
          <H0 style={{ textAlign: "center", marginTop: 24, width: "100%" }}>
            {Formatter.usd(state.amount * user?.near2usd)}
          </H0>
        }
      />

      {!state.isStake && (
        <Text style={{ textAlign: "center", marginTop: 16 }}>
          You have successfully transfered money to unstaked NEAR (0% APY)
        </Text>
      )}

      {state.isStake && (
        <Text style={{ textAlign: "center", marginTop: 16 }}>
          You have successfully
          <br />
          staked NEAR at {Formatter.round(user.state.apy * 100)}% APY
        </Text>
      )}

      <ActionButton style={{ marginTop: "auto" }} onClick={() => navigate("/stake", { replace: true })}>
        Open dashboard
      </ActionButton>
    </S.CardView>
  );
};

export default observer(SuccessStaking);
