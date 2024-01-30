import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import rockImage from "../../assets/rock.png";
import { ActionButton, ActivityIndicator, H0, Text, Tooltip } from "../../uikit";
import { useWallet } from "../../core/Accounts";
import { formatAmount } from "../../core/helpers";
import { Formatter } from "../../core/helpers";
import { TipUnstake } from "../Tips";
import * as S from "../styled";

const SuccessStaking = ({ defaultState, style }: { style?: any; defaultState?: { isStake: boolean; amount: number } }) => {
  const account = useWallet()!;
  const navigate = useNavigate();

  const [state, setState] = useState({ isStake: false, amount: 0 });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (defaultState != null) {
      setState(defaultState);
      setLoading(false);
    }

    const hash = new URL(window.location.href).searchParams.get("transactionHashes");
    if (hash == null) return;

    account.near.connection.provider.txStatus(hash, account.near.accountId).then(({ transaction }) => {
      if (transaction.signer_id !== account.near.accountId) return;
      const call = transaction.actions[0]?.FunctionCall;
      if (call == null) return;

      if (call.method_name === "deposit") {
        setState({ amount: formatAmount(call.deposit), isStake: true });
        setLoading(false);
        return;
      }

      if (call.method_name === "withdraw") {
        const args = JSON.parse(Buffer.from(call.args, "base64").toString("utf8"));
        setState({ amount: formatAmount(args.amount), isStake: false });
        setLoading(false);
        return;
      }
    });
  }, [account]);

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
        children={<TipUnstake user={account} />}
        open={account.near.hnear.tips.tipUnstake && state.isStake === false}
        position={["right center", "bottom left"]}
        closeOnDocumentClick={false}
        closeOnEscape={false}
        lockScroll
        offsetX={10}
        trigger={<H0 style={{ textAlign: "center", marginTop: 24, width: "100%" }}>{Formatter.usd(state.amount * account.tokens.usd(account.tokens.near))}</H0>}
      />

      {!state.isStake && <Text style={{ textAlign: "center", marginTop: 16 }}>You have successfully transfered money to unstaked NEAR (0% APY)</Text>}

      {state.isStake && (
        <Text style={{ textAlign: "center", marginTop: 16 }}>
          You have successfully
          <br />
          staked NEAR at {Formatter.round(account.near.hnear.apy)}% APY
        </Text>
      )}

      <ActionButton $id="StakeUnstakeSuccess.back" style={{ marginTop: "auto" }} onClick={() => navigate("/stake", { replace: true })}>
        Open dashboard
      </ActionButton>
    </S.CardView>
  );
};

export default observer(SuccessStaking);
