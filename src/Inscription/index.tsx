import React, { useEffect, useRef, useState } from "react";
import { Card, Container, Root } from "../Home/styled";
import Header from "../Home/Header";
import { ActionButton, ActivityIndicator, H1, Text } from "../uikit";
import * as S from "./styled";
import HereInput from "../uikit/Input";
import { formatNumber } from "../Staking/useAmountInput";
import { BN } from "bn.js";
import { formatNearAmount } from "near-api-js/lib/utils/format";
import { HereWallet } from "@here-wallet/core";
import { Formatter, parseAmount, wait } from "../core/helpers";
import { TGAS } from "../core/constants";
import { notify } from "../core/toast";
import { Account, transactions } from "near-api-js";
import { BoldP, H4, SmallText } from "../uikit/typographic";
import { base_decode } from "near-api-js/lib/utils/serialize";

const fetchBalance = async (accId: string) => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
    body: `{"query": "\\n        query MyQuery {\\n          holderInfo(id: \\"1DRAGON:${accId}\\") {\\n            accountId\\n            amount\\n            ticker\\n          }\\n        }\\n      "}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });

  const data = await res.json();
  return data.data.holderInfo.amount;
};

const fetchStats = async () => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
    body: `{"query":"query {\\n        tokenInfo (id: \\"1DRAGON\\") {\\n          ticker\\n          maxSupply\\n          totalSupply\\n          limit\\n        }\\n        holderCount (id: \\"1DRAGON\\") {\\n          count\\n        }\\n      }"}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });

  const data = await res.json();
  return data.data;
};

const here = new HereWallet({
  nodeUrl: "https://rpc.herewallet.app",
});

const Inscription = () => {
  const [count, setCount] = useState(0);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successed, setSuccessed] = useState(0);
  const [balance, setBalance] = useState("0");
  const [stats, setStats] = useState({
    limit: "100000000",
    maxSupply: "1000000000000000",
    ticker: "1dragon",
    totalSupply: "434551000035557",
    owners: "4898",
  });

  const [account, setAccount] = useState<Account | null>();

  useEffect(() => {
    const init = async () => {
      const account = await here.account().catch(() => null);
      setAccount(account);
    };

    setInterval(() => {
      fetch("https://api.herewallet.app/api/v1/rate/near_fee")
        .then((t) => t.json())
        .then((e) => setFee(e.fee));
    }, 30000);

    fetch("https://api.herewallet.app/api/v1/rate/near_fee")
      .then((t) => t.json())
      .then((e) => setFee(e.fee));

    init();
  }, []);

  useEffect(() => {
    if (!account) return;
    const fetch = async () => {
      fetchBalance(account.accountId).then((b) => setBalance(b));
      const stats = await fetchStats();
      setStats({ ...stats.tokenInfo, owners: stats.holderCount.count });
    };

    const timer = setInterval(fetch, 5000);
    fetch();

    return () => {
      clearInterval(timer);
    };
  }, [account]);

  const isStart = useRef(false);
  const startMint = async () => {
    if (isStart.current) return;
    if (loading) return;
    setLoading(true);
    isStart.current = true;

    if (account == null) {
      await here.signIn({ contractId: "inscription.near", allowance: parseAmount(10) });
      setAccount(await here.account());
    }

    if (account == null) {
      notify("Something wrong");
      setLoading(false);
      return;
    }

    let minted = 0;

    const publicKey = await account.connection.signer.getPublicKey(account.accountId, "mainnet");
    let { nonce } = await account.connection.provider.query<any>({
      account_id: account.accountId,
      request_type: "view_access_key",
      public_key: publicKey.toString(),
      finality: "optimistic",
    });

    const mintOne = async () => {
      nonce += 1;

      const block = await account.connection.provider.block({ finality: "final" });
      const blockHash = block.header.hash;

      const [tx, signed] = await transactions.signTransaction(
        transactions.createTransaction(
          account.accountId,
          publicKey,
          "inscription.near",
          nonce,
          [
            transactions.functionCall(
              "inscribe",
              { p: "nrc-20", op: "mint", tick: "1dragon", amt: stats.limit },
              new BN(TGAS * 30),
              new BN(0)
            ),
          ],
          base_decode(blockHash)
        ),
        account.connection.signer,
        account.accountId,
        "mainnet"
      );

      await account.connection.provider.sendTransactionAsync(signed);
      await wait(10000);

      setSuccessed((t) => t + 1);
      minted += 1;
      if (minted < count) await mintOne();
    };

    try {
      await mintOne();
      isStart.current = false;
      setLoading(false);
      setSuccessed(0);
      notify("Success!");
    } catch (e) {
      console.log(e);
      isStart.current = false;
      setLoading(false);
      setSuccessed(0);
      notify("Something wrong, try again");
    }
  };

  return (
    <Root>
      <Header />
      <Container
        style={{
          flexDirection: "row",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <H1>Mint 1DRAGON</H1>

        <div style={{ textAlign: "right" }}>
          <BoldP>Your balance: {balance} 1DRAGON</BoldP>
          <SmallText>The balance will be updated with a delay</SmallText>
        </div>
      </Container>

      <Container style={{ paddingTop: 0, maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ flex: 1, gap: 8 }}>
          <HereInput
            label="Transaction count"
            value={count}
            onChange={(e) => setCount(+formatNumber(e.target.value))}
            postfix=" "
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {fee != null && (
              <S.Row>
                <Text>Gas burn:</Text>
                <Text>{formatNearAmount(new BN(fee).muln(count).toString(), 8)} NEAR</Text>
              </S.Row>
            )}

            <S.Row>
              <Text>Receive:</Text>
              <Text>{count * 100000000} 1DRAGON</Text>
            </S.Row>
          </div>

          {account != null && (
            <S.Row style={{ alignItems: "center", marginTop: 24, gap: 16 }}>
              <ActionButton disabled={loading || count < 1} style={{ flex: 1 }} onClick={startMint}>
                {loading ? (
                  <>
                    <H4>Progress: {Formatter.round((successed / count) * 100, 2)}%</H4>
                  </>
                ) : (
                  "Start mint"
                )}
              </ActionButton>

              <ActionButton
                stroke
                style={{ flex: 1 }}
                onClick={async () => {
                  await here.signOut();
                  setAccount(null);
                }}
              >
                Logout
              </ActionButton>
            </S.Row>
          )}

          {account == null && (
            <ActionButton
              style={{ marginTop: 24 }}
              onClick={async () => {
                await here.signIn({ contractId: "inscription.near", allowance: parseAmount(10) });
                setAccount(await here.account());
              }}
            >
              Connect HERE
            </ActionButton>
          )}
        </Card>
        <Card style={{ gap: 8 }}>
          <S.Row>
            <Text>Token:</Text>
            <Text>1DRAGON</Text>
          </S.Row>
          <S.Row>
            <Text>Protocol:</Text>
            <Text>NRC-20</Text>
          </S.Row>
          <S.Row>
            <Text>Total Supply:</Text>
            <Text>{stats.maxSupply}</Text>
          </S.Row>
          <S.Row>
            <Text>Total Minted:</Text>
            <Text>
              {stats.totalSupply} ({Formatter.round((+stats.totalSupply / +stats.maxSupply) * 100, 2)}%)
            </Text>
          </S.Row>
          <S.Row>
            <Text>Mint Limit</Text>
            <Text>{stats.limit}</Text>
          </S.Row>
        </Card>
      </Container>
    </Root>
  );
};

export default Inscription;
