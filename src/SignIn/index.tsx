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
import {ActionView} from "../Widget/Connector/Action";
import styled from "styled-components";
import {Action} from "@here-wallet/core";
import {PublicKey} from "@near-js/crypto";
import BN from "bn.js";

const SignIn = () => {
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

  const tokens = Object.values(user.tokens.tokens)
    .sort((a, b) => user.tokens.fiat(b) - user.tokens.fiat(a))
    .filter((t) => t.symbol !== "HOT");

  const token = user.tokens.token(Chain.NEAR, asset);
  const cur = user.tokens.cur(token!);

  const tokenAmount = isFiat ? Formatter.round(+amount / cur.usd, cur.precision) : +amount;
  const fiatAmount = isFiat ? +amount : Formatter.round(+amount * cur.usd, cur.precision);
  const isTooMuch = token && isFiat ? fiatAmount > user.tokens.fiat(token) : tokenAmount > (token?.amountFloat ?? 0);
  const isDisabled = isTooMuch || !!receiver.validateError || !receiver.isExist || !token || tokenAmount <= 0;

  useEffect(() => {
    setParams({ recipient, asset, amount, comment, fiat: isFiat ? "true" : "false" }, { replace: true });
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

  const query = new URLSearchParams(window.location.search);

  let receiverId: string = "tipbot.near";
  let allowance: string = "";
  let methodNames:  string | string[] = [];
  let publicKey: string | PublicKey = query.get("publicKey");


  let addKeyAction: Action = {
    params: {publicKey: query.get("publicKey"), accessKey: {permission: {receiverId, allowance, methodNames}}},
    type: "AddKey"
  };

  const makeSignIn = async () => {
    if (isLoading) return;


    try {
      setLoading(true);
      /*const tx = await user.addKey({
        publicKey,
        contractId: receiverId,
        methodNames,
        //amount: new BN(250)
      });*/

      navigate(`/addKey/success?receiverId=${receiverId}`);
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
        <Card style={{ gridArea: "recipient", gap: 12, position: "relative" }}>
          <div style={{ position: "relative", paddingBottom: "10px" }}>
            <View style={{padding: "0 16px", alignItems: "center", justifyContent: "center"}}>
              <ActionView receiver={receiverId ?? "Your wallet"} action={addKeyAction}/>
            </View>

            {receiver.isLoading && <ActivityIndicator width={6} style={{ transform: "scale(0.4)", position: "absolute", top: -12, right: -8 }} />}

            {receiver.avatar && <AvatarImage style={{ position: "absolute", top: 8, right: 12 }} src={receiver.avatar} />}
          </div>

          {!receiver.isLoading && receiver.input.length > 0 && <TinyText style={{ marginTop: -4, color: colors.red, fontWeight: "bold" }}>{receiver.validateError}</TinyText>}




        {isTgMobile() ? (
          <ActionButton $id="Transfer.makeSignIn" big style={{ width: "100%" }} disabled={isLoading} onClick={makeSignIn}>
            {isLoading ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Add Key"}
          </ActionButton>
        ) : (
          <div style={{ marginTop: 20, display: "flex", gap: 80 }}>
            <ActionButton $id="Transfer.makeSignIn" style={{ width: 256 }} big disabled={isLoading} onClick={makeSignIn}>
              {isLoading ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Add Key"}
            </ActionButton>

            <Button $id="Transfer.back" onClick={() => navigate("/", { replace: true })}>
              <BoldP>Back</BoldP>
            </Button>
          </div>
        )}

        </Card>
      </Container>
    </Root>
  );
};

const View = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  flex: 1;
`;



export default observer(SignIn);
