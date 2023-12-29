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
import { BoldP, H4 } from "../uikit/typographic";

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

const fetchStats = async (accId: string) => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
    body: `{"query":"query {\\n        tokenInfo (id: \\"1DRAGON\\") {\\n          ticker\\n          maxSupply\\n          totalSupply\\n          limit\\n        }\\n        holderCount (id: \\"1DRAGON\\") {\\n          count\\n        }\\n      }"}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });

  const data = await res.json();
  return data.data;
};

const here = new HereWallet();

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

  const account = useRef<Account | null>();

  useEffect(() => {
    setInterval(() => {
      fetch("https://api.herewallet.app/api/v1/rate/near_fee")
        .then((t) => t.json())
        .then((e) => setFee(e.fee));
    }, 3000);

    const init = async () => {
      account.current = await here.account().catch(() => null);
      if (!account.current) return;
      setBalance(await fetchBalance(account.current.accountId));
      const stats = await fetchStats(account.current.accountId);
      setStats({ ...stats.tokenInfo, owners: stats.holderCount.count });
    };

    setInterval(async () => {
      if (!account.current) return;
      setBalance(await fetchBalance(account.current.accountId));
      const stats = await fetchStats(account.current.accountId);
      setStats({ ...stats.tokenInfo, owners: stats.holderCount.count });
    }, 5000);

    init();
  }, []);

  const startMint = async () => {
    if (loading) return;
    setLoading(true);

    if (account.current == null) {
      await here.signIn({ contractId: "inscription.near", allowance: parseAmount(10) });
      account.current = await here.account();
    }

    if (account.current == null) {
      notify("Something wrong");
      setLoading(false);
      return;
    }

    let isError = false;
    let minted = 0;

    const mintOne = async () => {
      if (isError) return;

      try {
        // @ts-ignore
        await account.current!.signTransaction("inscription.near", [
          transactions.functionCall(
            "inscribe",
            { p: "nrc-20", op: "mint", tick: "1dragon", amt: "100000000" },
            new BN(TGAS * 10),
            new BN(0)
          ),
        ]);

        await wait(1000);
        setSuccessed((t) => t + 1);
        minted += 1;

        console.log("SUCCESS", successed);
        if (minted < count) await mintOne();
      } catch (e) {
        console.log(e);
        isError = true;
        await wait(3000);
        isError = false;
        await mintOne();
      }
    };

    await mintOne();
    setLoading(false);
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
        <BoldP>Balance: {balance} 1DRAGON</BoldP>
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

          <S.Row style={{ alignItems: "center" }}>
            <ActionButton disabled={loading || count < 1} style={{ marginTop: 24, width: 300 }} onClick={startMint}>
              {loading ? (
                <>
                  <H4>Progress: {Formatter.round((successed / count) * 100, 2)}%</H4>
                </>
              ) : (
                "Start mint"
              )}
            </ActionButton>
          </S.Row>
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
