import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Modal } from "../../uikit/Modal";
import { colors } from "../../uikit/theme";
import { H3, SmallText, Text } from "../../uikit/typographic";
import { ActionButton, ActivityIndicator, Button } from "../../uikit";
import { useAmountInput } from "../useAmountInput";
import Icon from "../../uikit/Icon";

import { Formatter, isIOS, parseAmount } from "../../core/helpers";
import { useAnalytics } from "../../core/analytics";
import { useWallet } from "../../core/Accounts";
import { FullCardView } from "../styled";

import { AmountField, AmountInput, AmountInputWrap, StakeButton, SwitchButton } from "./styled";
import SuccessStaking from "./Success";

const ChangeStaking = () => {
  const user = useWallet()!;
  const track = useAnalytics("edit");

  const [isFiat, toggleFiat] = useState(false);
  const [isStake, toggleStake] = useState(true);
  const [isSuccess, setSuccess] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const usd2near = user.tokens.usd(user.tokens.near);
  const prefixer = (v: string) => (isFiat ? `$${v}` : v);

  const navigate = useNavigate();
  const { inputRef, handleChange, numValue, fontSize, value } = useAmountInput({
    maxWidth: 180,
    size: 48,
  });

  useEffect(() => {
    handleChange("0", prefixer);
    document.fonts.ready.then(() => handleChange("0", prefixer));
  }, []);

  if (user == null) {
    return <Navigate to="/stake" replace />;
  }

  const available = (isStake ? user.tokens.stakableNear : user.tokens.hnear.safeFloat) ?? 0;
  const amount = isFiat ? numValue / usd2near : numValue;
  const isDisabled = !amount || amount > available;

  const isMax = isFiat
    ? Formatter.round(numValue, 4) === Formatter.round(available * usd2near, 4)
    : Formatter.round(numValue, 4) === Formatter.round(available, 4);

  useEffect(() => {
    isStake ? track("switch_to_stake") : track("switch_to_unstake");
  }, [isStake]);

  const handleMax = () => {
    track("select_max");
    const max = Formatter.round(available * (isFiat ? usd2near : 1), 4);
    handleChange(max, prefixer);
  };

  const handleSwitch = () =>
    toggleFiat((is) => {
      is = !is;
      is ? track("switch_to_fiat") : track("switch_to_near");
      const prefixer = (v: string) => (is ? `$${v}` : v);

      let newValue;
      if (isMax) newValue = is ? available * usd2near : available;
      else newValue = is ? numValue * usd2near : numValue / usd2near;
      handleChange(Formatter.round(newValue, 4), prefixer);
      return is;
    });

  const handleApprove = async () => {
    try {
      setLoading(true);
      if (isStake) {
        track("stake");
        await user.near.hnear.stake(parseAmount(amount));
      } else {
        track("unstake");
        await user.near.hnear.unstake(parseAmount(amount));
      }

      setLoading(false);
      setSuccess(true);
      isStake ? track("stake_success") : track("unstake_success");
    } catch (e) {
      console.log(e);
      setLoading(false);
      isStake ? track("stake_failed") : track("unstake_failed");
    }
  };

  const view = (
    <>
      <Button style={{ position: "absolute", left: 32, top: 28 }} onClick={() => navigate("/stake", { replace: true })}>
        <Icon name="arrow-left" />
      </Button>

      <StakeButton onClick={() => toggleStake((v) => !v)}>
        <SmallText>
          From: <span style={{ color: colors.blackPrimary }}>{isStake ? "unstaked NEAR" : "staked NEAR"}</span>
        </SmallText>
        <Icon name="switch-vertical" />
        <SmallText>
          To: <span style={{ color: colors.blackPrimary }}>{isStake ? "staked NEAR" : "unstaked NEAR"}</span>
        </SmallText>
      </StakeButton>

      <AmountField onClick={() => inputRef.current?.focus()}>
        <AmountInputWrap style={{ height: fontSize }}>
          <AmountInput
            autoFocus
            ref={inputRef}
            style={{ height: fontSize }}
            onChange={(e) => handleChange(e.target.value, prefixer)}
            value={value}
            inputMode="decimal"
          />
          {isFiat ? (
            ""
          ) : (
            <H3
              style={{
                height: fontSize,
                display: "flex",
                alignItems: isIOS() ? "flex-end" : "center",
                fontSize: fontSize * 0.6 + "px",
                lineHeight: fontSize * 0.6 + "px",
              }}
            >
              NEAR
            </H3>
          )}
          <SwitchButton onClick={handleSwitch}>
            <Icon name="switch-horizontal" />
          </SwitchButton>
        </AmountInputWrap>

        <Button onClick={handleMax}>
          <SmallText style={{ fontWeight: "bolder", color: colors.pink }}>Select max</SmallText>
        </Button>
      </AmountField>

      <SmallText style={{ marginBottom: 16 }}>
        Available balance: {isFiat ? Formatter.usd(available * usd2near, 4) : Formatter.round(available, 4) + " NEAR"}
      </SmallText>

      <ActionButton disabled={isDisabled} onClick={handleApprove}>
        {isStake ? "Stake" : "Unstake"}
      </ActionButton>
    </>
  );

  return (
    <FullCardView>
      {isSuccess ? (
        <SuccessStaking style={{ paddingTop: 0, paddingBottom: 0 }} defaultState={{ amount, isStake }} />
      ) : (
        view
      )}
      <Modal isShow={isLoading}>
        <ActivityIndicator />
        <Text style={{ marginTop: 22, color: colors.blackSecondary }}>Signing transaction</Text>
      </Modal>
    </FullCardView>
  );
};

export default observer(ChangeStaking);
