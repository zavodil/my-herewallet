import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import path from "path";

import { ActionButton, ActivityIndicator, Button, H2, H3, Text, Tooltip } from "../../uikit";
import { SmallText } from "../../uikit/typographic";
import { colors } from "../../uikit/theme";
import { Modal } from "../../uikit/Modal";

import { useAmountInput } from "../useAmountInput";
import { useWallet } from "../../core/Accounts";
import { useAnalytics } from "../../core/analytics";
import { DEFAULT_APY } from "../../core/constants";
import { Formatter, parseAmount } from "../../core/helpers";
import * as S from "../styled";

import { AmountInput, Divider, EditButton, Flex, InputCard } from "./styled";

const FirstStaking = () => {
  const user = useWallet()!;
  const [isSuccess, setSuccess] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const track = useAnalytics("first_stake");

  const { inputRef, handleChange, value, numValue, fontSize } = useAmountInput({
    maxWidth: 150,
    size: 32,
  });

  const available = user.tokens.stakableNear;
  const isDisabled = !numValue || numValue > available;
  const prefixer = (t: string) => t.slice(0, 6);

  useEffect(() => {
    const value = user.tokens.stakableNear;
    handleChange(value, prefixer);
    document.fonts.ready.then(() => handleChange(value, prefixer));
  }, []);

  const handleMax = () => {
    track("select_max");
    handleChange(user.tokens.stakableNear, prefixer);
  };

  if (user == null) {
    return <Navigate to="/stake" replace />;
  }

  const handleApprove = async () => {
    try {
      track("stake");
      setLoading(true);
      await user.near.hnear.stake(parseAmount(value));
      setLoading(false);
      setSuccess(true);
    } catch (e) {
      console.log(e);
      track("stake_failed");
      setLoading(false);
    }
  };

  const view = (
    <>
      <InputCard onClick={() => inputRef.current?.focus()}>
        <Flex>
          <Text style={{ fontWeight: "bolder" }}>Stake</Text>
          <EditButton style={{ marginLeft: "auto" }} onClick={handleMax}>
            Select max
          </EditButton>
        </Flex>
        <Flex onClick={() => inputRef.current?.focus()}>
          <AmountInput
            min={0}
            autoFocus
            ref={inputRef}
            value={value}
            inputMode="decimal"
            onChange={(e) => handleChange(e.target.value, prefixer)}
          />
          <H3 style={{ marginBottom: 5, marginLeft: 4, fontSize: fontSize * 0.8 }}>NEAR</H3>
          <SmallText style={{ marginLeft: "auto", marginBottom: 7 }}>{Formatter.usd(+value * 2.5)}</SmallText>
        </Flex>
      </InputCard>

      <InputCard style={{ background: "#359C2C", marginTop: 12, border: "none" }}>
        <Flex>
          <Text style={{ fontWeight: "bolder", color: "rgba(255, 255, 255, 0.7)" }}>Expected income</Text>
          <SmallText style={{ color: "#fff", marginLeft: "auto" }}>
            {Formatter.usd(+value * DEFAULT_APY * 2.5, 3)}
          </SmallText>
        </Flex>

        <Flex>
          <H2 style={{ color: "#fff", fontSize: fontSize }}>~{(+value * DEFAULT_APY).toFixed(2)}</H2>
          <H3 style={{ marginBottom: 3, marginLeft: 8, color: "#fff", fontSize: fontSize * 0.8 }}>NEAR/year</H3>
        </Flex>
      </InputCard>

      <Divider />

      <S.Row>
        <Text style={{ color: "#6B6661" }}>APY</Text>
        <Flex>
          <Tooltip
            offsetX={10}
            position={["left center", "bottom center"]}
            trigger={
              <Button style={{ marginRight: 8, marginBottom: 1 }}>
                <Text style={{ fontWeight: "bolder", color: colors.pink }}>How to get more?</Text>
              </Button>
            }
          >
            <Text>
              <b>Tip: </b>The less you use withdraw from staking the more APY you will get.
            </Text>
          </Tooltip>

          <Text style={{ fontWeight: "bolder" }}>{Formatter.round(user.near.hnear.apy)}%</Text>
        </Flex>
      </S.Row>
      <S.Row>
        <Text style={{ color: "#6B6661" }}>Instant unstake fee</Text>
        <Text style={{ fontWeight: "bolder" }}>0%</Text>
      </S.Row>

      <ActionButton disabled={isDisabled} style={{ marginTop: "auto" }} onClick={handleApprove}>
        Stake
      </ActionButton>
    </>
  );

  return (
    <S.FullCardView>
      {isSuccess ? <Navigate to="/stake/success" replace /> : view}
      <Modal isShow={isLoading}>
        <ActivityIndicator />
        <Text style={{ marginTop: 22, color: colors.blackSecondary }}>Signing transaction</Text>
      </Modal>
    </S.FullCardView>
  );
};

export default observer(FirstStaking);
