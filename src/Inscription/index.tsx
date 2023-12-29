import React, { useEffect, useRef, useState } from "react";
import { base_decode } from "near-api-js/lib/utils/serialize";
import { formatNearAmount } from "near-api-js/lib/utils/format";
import { Account, transactions } from "near-api-js";
import { HereWallet } from "@here-wallet/core";
import { useNavigate, useParams } from "react-router-dom";
import isMobile from "is-mobile";
import { BN } from "bn.js";

import Header from "../Home/Header";
import HereInput from "../uikit/Input";
import { formatNumber } from "../Staking/useAmountInput";
import { Formatter, parseAmount, wait } from "../core/helpers";
import { BoldP, H2, H4, SmallText } from "../uikit/typographic";
import { Card, Container, Root, TokenAction } from "../Home/styled";
import { ActionButton, Button, H1, Text } from "../uikit";
import { TGAS } from "../core/constants";
import { notify } from "../core/toast";
import * as S from "./styled";
import Icon from "../uikit/Icon";
import { accounts } from "../core/Accounts";

const fetchAll = async () => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
    referrer: "https://www.nearscription.com/",
    body: JSON.stringify({
      query: `query MyQuery {
        tokenInfos {
          ticker
          decimals
          creatorId
          limit
          maxSupply
          totalSupply
          createdBlockTimestamp
          id
        }
        ftWrappers {
          ticker
          amount
          tokenId
          id
        }
        holderCounts {
          id
          count
        }
      }`,
    }),
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });

  return await res.json();
};

const fetchToken = async (token: string, accId?: string) => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    body: JSON.stringify({
      query: `query {
        holderCount (id: "${token}") { count }
        tokenInfo (id: "${token}") { ticker maxSupply totalSupply limit }
        ${accId ? `holderInfo(id: "${token}:${accId}") { accountId amount ticker }` : ""}
      }`,
    }),
  });

  const data = await res.json();
  return data.data || {};
};

const here = new HereWallet({
  nodeUrl: "https://rpc.herewallet.app",
});

export const InscriptionTokens = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [rates, setRates] = useState<Record<string, number[]>>({ NEAT: [0, 0], "1DRAGON": [0, 0] });

  useEffect(() => {
    accounts.api.getRates().then(setRates);

    fetchAll().then(({ data }) => {
      const list = data.holderCounts.flatMap((t: any) => {
        const token: any = data.tokenInfos.find((i: any) => i.id === t.id);
        const wrap: any = data.ftWrappers.find((i: any) => i.id === t.id);
        if (token == null) return [];
        return [
          {
            ...token,
            owner: t.count,
            ftAmount: wrap?.amount,
            ftContract: wrap?.tokenId,
            progress: Formatter.round((token.totalSupply / token.maxSupply) * 100),
          },
        ];
      });

      setList(list.sort((a: any, b: any) => b.progress - a.progress));
    });
  }, []);

  return (
    <Root>
      <Header />
      <Container>
        <Card style={{ flex: 1 }}>
          <H1>Inscription tokens</H1>

          {list.map((token: any) => {
            return (
              <S.Row
                key={token.id}
                onClick={() => navigate(`/inscription/${token.id}`)}
                style={{ padding: "12px 0", borderBottom: "1px solid var(--Stroke)", cursor: "pointer" }}
              >
                <div style={{ flex: 1 }}>
                  <SmallText>TICKER</SmallText>
                  <Text>{token.id}</Text>
                </div>
                <div style={{ flex: 1 }}>
                  <SmallText>Owners</SmallText>
                  <Text>{token.owner}</Text>
                </div>
                <div style={{ flex: 1 }}>
                  <SmallText>Minted</SmallText>
                  <Text>{token.progress}%</Text>
                </div>
                <div style={{ flex: 1 }}>
                  <SmallText>Market Price</SmallText>
                  {token.ftContract != null && rates[token.id] ? (
                    <Text>{rates[token.id][0]}</Text>
                  ) : (
                    <Text style={{ color: "#DB8520" }}>
                      Not listed <Icon style={{ marginBottom: -5 }} name="warning" />
                    </Text>
                  )}
                </div>
                <TokenAction>
                  <Icon name="arrow-right" />
                </TokenAction>
              </S.Row>
            );
          })}
        </Card>
        <Card style={{ maxWidth: 380, height: "fit-content" }}>
          <H4 style={{ marginBottom: 8 }}>Disclaimer</H4>
          <Text>Tokens aren't linked to HERE Wallet team. We offer minting only.</Text>
          <BoldP>
            HERE Wallet isn't liable for tokens changes. This platform allows NRC-20 tokens minting and cost estimation.
          </BoldP>
          <Text>HERE Wallet isn't responsible for tokens minted here.</Text>
        </Card>
      </Container>
    </Root>
  );
};

const Inscription = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [count, setCount] = useState(0);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successed, setSuccessed] = useState(0);
  const [balance, setBalance] = useState("0");
  const [nearBalance, setNearBalance] = useState("0");
  const [gasPrice, setGasPrice] = useState("0");
  const [stats, setStats] = useState({
    limit: "1",
    maxSupply: "0",
    ticker: params.id || "1DRAGON",
    totalSupply: "0",
    owners: "0",
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
    const fetch = async () => {
      account?.getAccountBalance().then((b) => {
        setNearBalance(b.available);
      });

      fetchToken(params.id || "1DRAGON", account?.accountId).then((stats) => {
        setStats((t) => ({ ...(stats.tokenInfo || t), owners: stats.holderCount?.count ?? "0" }));
        setBalance(stats.holderInfo?.amount || "0");
      });
    };

    const fetchGasPrice = async () => {
      if (!account) return;
      const block = await account.connection.provider.block({ finality: "final" });
      const blockHash = block.header.hash;
      const price = await account.connection.provider.gasPrice(blockHash);
      setGasPrice(price.gas_price);
    };

    const timer = setInterval(fetch, 5000);
    fetchGasPrice();
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

      const price = await account.connection.provider.gasPrice(blockHash);
      const gasPrice = new BN(price.gas_price).mul(new BN(TGAS * 20));
      setGasPrice(price.gas_price);

      const nearBalance = (await account?.getAccountBalance()).available;
      if (new BN(nearBalance).lt(gasPrice)) {
        notify(
          `You don't have enough NEAR to pay for gas. The account must have at least ${formatNearAmount(
            gasPrice.toString()
          )} NEAR`,
          10000
        );
        throw Error();
      }

      const [tx, signed] = await transactions.signTransaction(
        transactions.createTransaction(
          account.accountId,
          publicKey,
          "inscription.near",
          nonce,
          [
            transactions.functionCall(
              "inscribe",
              { p: "nrc-20", op: "mint", tick: stats.ticker, amt: stats.limit || "1" },
              new BN(TGAS * 10),
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

  const burn = formatNearAmount(new BN(fee || 0).muln(count).toString(), 8);
  const nativeBurn = formatNearAmount(
    new BN(gasPrice)
      .mul(new BN(TGAS * 5))
      .muln(count)
      .toString(),
    8
  );

  return (
    <Root>
      <Header />

      <Container
        style={{
          flexDirection: isMobile() ? "column" : "row",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "left",
          marginBottom: -40,
        }}
      >
        <Button onClick={() => navigate("/inscription/tokens")}>
          <Icon name="arrow-left" />
        </Button>

        <H1>Mint {stats.ticker.toUpperCase()}</H1>
      </Container>

      <Container
        style={{
          flexDirection: isMobile() ? "column" : "row",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <div style={{ width: "100%", textAlign: "left" }}>
          <BoldP>Balance: {formatNearAmount(nearBalance, 4)} NEAR</BoldP>
          <SmallText>If you have staked NEAR, unstake them to use</SmallText>
        </div>

        <div style={{ width: "100%", textAlign: isMobile() ? "left" : "right" }}>
          <BoldP>
            You minted: {balance} {stats.ticker.toUpperCase()}
          </BoldP>
          <SmallText>The balance will be updated with a delay</SmallText>
        </div>
      </Container>

      <Container style={{ paddingTop: 0, maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ flex: 1, gap: 8, height: "fit-content" }}>
          {stats.maxSupply !== "0" && stats.totalSupply === stats.maxSupply ? (
            <H2>Mint is over</H2>
          ) : (
            <>
              <HereInput
                label="Transaction count"
                value={count}
                onChange={(e) => setCount(+formatNumber(e.target.value))}
                postfix=" "
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {fee != null && (
                  <S.Row>
                    <Text>Gas burn (approx.):</Text>
                    <Text style={{ textAlign: "right" }}>{burn === "0" ? nativeBurn : burn} NEAR</Text>
                  </S.Row>
                )}

                <S.Row>
                  <Text>Receive:</Text>
                  <Text style={{ textAlign: "right" }}>
                    {count * 100000000} {stats.ticker.toUpperCase()}
                  </Text>
                </S.Row>
              </div>
            </>
          )}

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
        <Card style={{ gap: 8, overflow: "hidden" }}>
          <S.Row>
            <Text>Token:</Text>
            <Text>{stats.ticker.toUpperCase()}</Text>
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
            <Text>{stats.limit || "1"}</Text>
          </S.Row>

          <S.Row style={{ marginTop: 32 }}>
            <BoldP>Previous NRC-20 tokens:</BoldP>
          </S.Row>

          <S.Row>
            <BoldP>NEAT</BoldP>
            <Text>100% Minted</Text>
          </S.Row>

          <S.Row>
            <BoldP>1DRAGON</BoldP>
            <Text>100% Minted</Text>
          </S.Row>
        </Card>
      </Container>

      <Container style={{ paddingTop: 0, maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ flex: 1 }}>
          <H4>Disclaimer</H4>
          <Text>
            {stats.ticker.toUpperCase()} token isn't linked to HERE Wallet team. We offer minting only.{" "}
            <BoldP>
              HERE Wallet isn't liable for token changes. This platform allows NRC-20 token minting and cost estimation.
            </BoldP>{" "}
            HERE Wallet isn't responsible for tokens minted here.
          </Text>
        </Card>
      </Container>
    </Root>
  );
};

export default Inscription;
