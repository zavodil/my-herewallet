import React, { useEffect, useState } from "react";
import { generateFromString } from "generate-avatar";
import { toNonDivisibleNumber } from "@ref-finance/ref-sdk";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";

import Header from "../Home/Header";
import { Card, Root, TokenAction, TokenIcon } from "../Home/styled";
import { BoldP, H4, SmallText, Text, TinyText } from "../uikit/typographic";
import { ActionButton, ActivityIndicator, Button, H2 } from "../uikit";
import HereInput from "../uikit/Input";
import Icon from "../uikit/Icon";

import { notify } from "../core/toast";
import { Receiver } from "../core/Receiver";
import { useWallet } from "../core/Accounts";
import { AvatarImage } from "../Home/Header/styled";
import { formatNumber } from "../Staking/useAmountInput";
import { Formatter, truncateAddress } from "../core/helpers";
import { Chain, FtModel } from "../core/token/types";
import HereSelect from "../uikit/Selector";
import { colors } from "../uikit/theme";

import { Container, InputButton, TokenOption } from "./styled";
import { useNavigateBack } from "../useNavigateBack";
import { isTgMobile } from "../env";

const Transfer = () => {
  useNavigateBack("/");
  const user = useWallet()!;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [recipient, setRecipient] = useState(params.get("recipient") || "");
  const [amount, setAmount] = useState(params.get("amount") || "0");
  const [asset, setAsset] = useState(params.get("asset") || "");
  const [comment, setComment] = useState(params.get("comment") || "");
  const [isFiat, setFiat] = useState(params.get("fiat") === "true" ? true : false);
  const [isLoading, setLoading] = useState(false);

  const [receiver, setReceiver] = useState(() => new Receiver(user));

  const tokens = Object.values(user.tokens.tokens).sort((a, b) => user.tokens.fiat(b) - user.tokens.fiat(a));
  const token = user.tokens.token(Chain.NEAR, asset);
  const cur = user.tokens.cur(token!);

  const tokenAmount = isFiat ? Formatter.round(+amount / cur.usd, cur.precision) : +amount;
  const fiatAmount = isFiat ? +amount : Formatter.round(+amount * cur.usd, cur.precision);
  const isTooMuch = token && isFiat ? fiatAmount > user.tokens.fiat(token) : tokenAmount > (token?.amountFloat ?? 0);
  const isDisabled = isTooMuch || !!receiver.validateError || !receiver.isExist || !token || tokenAmount <= 0;

  useEffect(() => {
    setParams({ recipient, asset, amount, comment, fiat: isFiat ? "true" : "false" });
  }, [recipient, asset, amount, isFiat, comment]);

  useEffect(() => {
    const receiver = new Receiver(user);
    receiver.setInput(recipient);
    receiver.load();
    setReceiver(receiver);
    user.loadContacts();
  }, [user]);

  useEffect(() => {
    receiver.setInput(recipient);
    receiver.load();
  }, [recipient]);

  const selectMax = () => {
    setAmount((token?.amountFloat ?? 0).toString());
  };

  const makeTransfer = async () => {
    if (!token || isLoading) return;

    try {
      setLoading(true);
      const tx = await user.transfer({
        type: "address",
        amount: toNonDivisibleNumber(token.decimal, tokenAmount.toString()),
        receiver: recipient,
        token: token.id,
        comment,
      });

      navigate(`/transfer/success?tx=${tx}&receiver=${recipient}&token=${token.symbol}&amount=${tokenAmount}`);
      setLoading(false);
    } catch (e: any) {
      console.log(e);
      notify(e?.toString ? e.toString() : "Transfer failed");
      setLoading(false);
    }
  };

  return (
    <Root>
      {!isTgMobile() && <Header />}

      <Container>
        {!isTgMobile() && (
          <div style={{ gridArea: "navigation" }}>
            <Link to="/" replace style={{ textDecoration: "none", display: "inline-block" }}>
              <Button $id="Transfer.back" style={{ gap: 8 }}>
                <Icon name="arrow-left" />
                <H2>Transfer</H2>
              </Button>
            </Link>
          </div>
        )}

        <Card style={{ gridArea: "recipient", gap: 12, position: "relative" }}>
          <H4>Recipient</H4>

          <div style={{ position: "relative" }}>
            <HereInput label="Wallet address" autoCapitalize="off" autoCorrect="off" autoComplete="off" value={recipient} onChange={(e) => setRecipient(e.target.value)} />

            {receiver.isLoading && <ActivityIndicator width={6} style={{ transform: "scale(0.4)", position: "absolute", top: -12, right: -8 }} />}

            {receiver.avatar && <AvatarImage style={{ position: "absolute", top: 8, right: 12 }} src={receiver.avatar} />}
          </div>

          {!receiver.isLoading && receiver.input.length > 0 && (
            <TinyText style={{ marginTop: -4, color: colors.red, fontWeight: "bold" }}>{!receiver.isExist ? "This account is not exist" : receiver.validateError}</TinyText>
          )}
        </Card>

        <Card style={{ gridArea: "asset", gap: 12 }}>
          <H4>What asset</H4>

          <HereSelect
            label="Select asset"
            options={tokens.filter((t) => t.amountFloat > 0)}
            value={tokens.find((ft) => ft.symbol === asset)}
            renderOption={(ft: FtModel) => (
              <TokenOption $id="Transfer.selectAsset" key={ft.id} onClick={() => setAsset(ft.symbol)}>
                <TokenIcon src={ft.icon} />
                <div style={{ textAlign: "left" }}>
                  <BoldP style={{ lineHeight: "20px" }}>{ft.name}</BoldP>
                  <TinyText>{ft.symbol}</TinyText>
                </div>

                <div style={{ marginLeft: "auto", textAlign: "right", marginTop: -4 }}>
                  <SmallText style={{ fontWeight: 800, color: "var(--Black-Primary)" }}>{Formatter.usd(user.tokens.fiat(ft))}</SmallText>
                  <TinyText>
                    {ft.amountFloat} {ft.symbol}
                  </TinyText>
                </div>
              </TokenOption>
            )}
          />

          {!isTgMobile() && (
            <div style={{ display: "flex", gap: 12 }}>
              {tokens.slice(0, 3).map((ft) => (
                <TokenAction
                  onClick={() => setAsset(ft.symbol)}
                  style={{
                    borderColor: ft.symbol == asset ? "var(--Black-Primary)" : "var(--Stroke)",
                    width: "fit-content",
                    borderRadius: 12,
                    height: 56,
                    padding: 8,
                    gap: 8,
                  }}
                >
                  <TokenIcon src={ft.icon} />
                  <div style={{ textAlign: "left", height: 40 }}>
                    <SmallText style={{ fontWeight: 800, color: "var(--Black-Primary)" }}>
                      {ft.amountFloat} {ft.symbol}
                    </SmallText>
                    <TinyText>{Formatter.usd(user.tokens.fiat(ft))}</TinyText>
                  </div>
                </TokenAction>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ gridArea: "amount", gap: 12, position: "relative" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <H4>Amount</H4>

            {!isNaN(+formatNumber(amount)) && token != null && (
              <Text style={{ color: colors.blackSecondary }}>
                {Formatter.usd(user.tokens.fiat(token))} ({token.amountFloat} {token.symbol})
              </Text>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <HereInput
              label="Amount"
              value={(isFiat ? "$" : "") + amount}
              postfix={isFiat ? `${tokenAmount} ${token?.symbol ?? ""}` : fiatAmount > 0 ? Formatter.usd(fiatAmount) : ""}
              onChange={(e) => setAmount(formatNumber(e.target.value))}
            />

            <InputButton $id="Transfer.max" style={{ position: "absolute", top: 10, right: 12 }} onClick={selectMax}>
              <SmallText>MAX</SmallText>
            </InputButton>

            {user.tokens.fiat(token) > 0.01 && (
              <InputButton $id="Transfer.switchUsd" $active={isFiat} style={{ position: "absolute", top: 10, right: 78 }} onClick={() => setFiat((t) => !t)}>
                <SmallText>USD</SmallText>
              </InputButton>
            )}
          </div>

          {isTooMuch && <TinyText style={{ marginTop: -4, fontWeight: "bold", color: colors.red }}>Not enough balance</TinyText>}

          {!token && <TinyText style={{ marginTop: -4, fontWeight: "bold", color: colors.red }}>Please select asset</TinyText>}

          <HereInput multiline style={{ height: 100 }} onChange={(e) => setComment(e.target.value)} label="Note (optional)" value={comment} />
        </Card>

        {!isTgMobile() && (
          <Card style={{ gridArea: "contacts", height: "fit-content", maxHeight: 400, overflowY: "auto", gap: 12 }}>
            <Text style={{ color: "var(--Black-Secondary" }}>Recent recipients</Text>

            {user.contacts.map((item) => (
              <Button $id="Transfer.selectContact" style={{ gap: 12 }} key={item.account_id} onClick={() => setRecipient(item.account_id)}>
                <AvatarImage style={{ flexShrink: 0 }} src={item.avatar_url || `data:image/svg+xml;utf8,${generateFromString(item.account_id)}`} />
                <Text>{truncateAddress(item.account_id)}</Text>
              </Button>
            ))}

            {user.contacts.length === 0 && <Text>Yon dont have contacts yet. Maked transfers will be stay here </Text>}
          </Card>
        )}

        {isTgMobile() ? (
          <ActionButton $id="Transfer.makeTransfer" big style={{ width: "100%" }} disabled={isDisabled || isLoading} onClick={makeTransfer}>
            {isLoading ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Transfer"}
          </ActionButton>
        ) : (
          <div style={{ marginTop: 20, display: "flex", gap: 80 }}>
            <ActionButton $id="Transfer.makeTransfer" style={{ width: 256 }} big disabled={isDisabled || isLoading} onClick={makeTransfer}>
              {isLoading ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Transfer"}
            </ActionButton>

            <Button $id="Transfer.back" onClick={() => navigate("/", { replace: true })}>
              <BoldP>Back</BoldP>
            </Button>
          </div>
        )}
      </Container>
    </Root>
  );
};

export default observer(Transfer);
