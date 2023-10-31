import React, { useEffect, useState } from "react";
import { base_encode } from "near-api-js/lib/utils/serialize";
import { Link, useNavigate } from "react-router-dom";

import introImage from "../assets/intro.png";
import hereWebLogo from "../assets/here-web.svg?url";
import LogoutIcon from "../assets/icons/logout.svg";

import { ActionButton, ActivityIndicator, Button, H0, H3, Text } from "../uikit";
import { BoldP, SmallText, H2 } from "../uikit/typographic";
import { HereButton } from "../uikit/button";
import { colors } from "../uikit/theme";

import { useWallet } from "../core/useWallet";
import { formatAmount, Formatter } from "../helpers";
import { Chain, FtAsset, TransactionModel } from "./types";
import Transactions from "./Transactions";
import { HereApi } from "./api";
import {
  Page,
  Root,
  Card,
  Header,
  BalanceCard,
  CardIntro,
  TokenCard,
  TokensCard,
  HomeGlobalStyle,
} from "./styled";
import { QueryResponseKind } from "near-api-js/lib/providers/provider";

const api = new HereApi();
const usd = (ft: FtAsset) => formatAmount(ft.amount || "0", ft.decimal) * ft.usd_rate;
const NEAR = {
  chain: Chain.NEAR,
  coingecko_id: "near",
  is_stable: false,
  amount: "0",
  pending: "0",
  freeze: "0",
  image_url: "https://assets.coingecko.com/coins/images/10365/large/near.png?1677061777",
  contract_address: "",
  symbol: "NEAR",
  name: "NEAR",
  decimal: 24,
  asset: "NEAR",
  usd_rate: 1.29,
};

const getStorageJson = (key: string, def: any) => {
  try {
    return JSON.parse(localStorage.getItem(key)!) ?? def;
  } catch {
    return def;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { selector, user } = useWallet();

  const [balance, setBalance] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [trxs, setTrxs] = useState<TransactionModel[]>([]);
  const [tokens, setTokens] = useState<Record<string, FtAsset>>({ NEAR });

  const fetchAll = () => {
    if (user == null) return;
    api.getTransactions().then((list) => {
      window.localStorage.setItem(`${user.wallet.accountId}:trxs`, JSON.stringify(list));
      setTrxs(list);
    });

    api.getTokens().then(({ tokens, balance_usd }) => {
      const list = tokens.filter((ft) => ft.chain === Chain.NEAR);
      if (list.length === 0) list.push(NEAR);

      const map = list.reduce((acc, ft) => {
        acc[ft.symbol] = ft;
        return acc;
      }, {} as Record<string, FtAsset>);

      setTokens(map);
      setBalance(balance_usd);
      fetchTokens(list);

      window.localStorage.setItem(`${user.wallet.accountId}:tokens`, JSON.stringify(map));
      window.localStorage.setItem(`${user.wallet.accountId}:balance`, String(balance_usd));
    });
  };

  const fetchTokens = async (fts: FtAsset[]) => {
    if (user == null) return;
    for (let ft of fts) {
      if (ft.symbol === "NEAR") {
        const { total } = await user.wallet.account.getAccountBalance();
        return setTokens((tokens) => {
          tokens[ft.symbol] = { ...ft, amount: total };
          return tokens;
        });
      }

      const { result } = await user.wallet.provider.query<{ result: string } & QueryResponseKind>({
        request_type: "call_function",
        account_id: ft.contract_address,
        method_name: "ft_balance_of",
        finality: "final",
      });

      setTokens((tokens) => {
        tokens[ft.symbol] = { ...ft, amount: result };
        return tokens;
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem(`${user.wallet.accountId}:jwt`);
    setTokens(getStorageJson(`${user.wallet.accountId}:tokens`, { NEAR }));
    setBalance(getStorageJson(`${user.wallet.accountId}:balance`, 0));
    setTrxs(getStorageJson(`${user.wallet.accountId}:trxs`, []));
    api.setToken(token);
    if (token) fetchAll();
  }, [user]);

  const register = async (id: string) => {
    if (selector == null) return;

    setLoading(true);
    try {
      const wallet = await selector.wallet(id);
      await wallet.signIn({ contractId: "", accounts: [] });

      const nonce = [...crypto.getRandomValues(new Uint8Array(32))];
      // @ts-expect-error: signMessage exist
      const sign = await wallet.signMessage({
        nonce: Buffer.from(nonce),
        recipient: "HERE Wallet",
        message: "web_wallet",
      });

      const token = await api.auth({
        msg: "web_wallet",
        device_id: api.deviceId,
        account_sign: base_encode(Buffer.from(sign.signature, "base64")),
        device_name: navigator.userAgent,
        near_account_id: sign.accountId,
        public_key: sign.publicKey.toString(),
        nonce: nonce,
        web_auth: true,
      });

      localStorage.setItem(`${sign.accountId}:jwt`, token);
      api.setToken(token);
      fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const disconnectHere = async () => {
    if (selector == null || user == null) return;
    const id = user.wallet.accountId;
    await user.wallet.wallet.signOut();
    localStorage.removeItem(`${id}:jwt`);
  };

  if (isLoading || selector == null) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </div>
    );
  }

  if (user == null) {
    return (
      <Page>
        <CardIntro
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <img style={{ width: 400, objectFit: "contain" }} src={introImage} />
          <img style={{ marginTop: 42, objectFit: "contain" }} src={hereWebLogo} />
          <BoldP style={{ marginTop: 16 }}>Web Wallet for NEAR Protocol</BoldP>
        </CardIntro>

        <Card
          style={{
            gap: 16,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <H0>Get started!</H0>
          <BoldP style={{ marginTop: -16, marginBottom: 32 }}>
            Connect your wallet to view account details
          </BoldP>

          <ActionButton style={{ width: 400 }} onClick={() => register("here-wallet")}>
            Connect HERE Wallet
          </ActionButton>

          <ActionButton style={{ width: 400 }} onClick={() => register("near-snap")}>
            Connect Near Metamask Snap
          </ActionButton>

          <a href="https://www.banyan.gg/" style={{ textDecoration: "none", marginTop: -12 }}>
            <SmallText>Sponsored by BANYAN Collective</SmallText>
          </a>
        </Card>
      </Page>
    );
  }

  console.log(tokens);

  return (
    <Root>
      <HomeGlobalStyle />
      <Header>
        <Link to="/">
          <img style={{ height: 22, objectFit: "contain" }} src={hereWebLogo} />
        </Link>

        <Button style={{ gap: 4 }} onClick={() => disconnectHere()}>
          <Text style={{ fontWeight: "bold" }}>
            {user.wallet.accountId.length > 16
              ? user.wallet.accountId.slice(0, 8) + ".." + user.wallet.accountId.slice(-8)
              : user.wallet.accountId}
          </Text>
          <LogoutIcon />
        </Button>
      </Header>

      <BalanceCard>
        <div>
          <SmallText style={{ color: colors.blackSecondary, fontWeight: "bold" }}>
            Total Balance
          </SmallText>
          <H2>${Formatter.round(balance, 2)}</H2>
        </div>

        <div>
          <HereButton style={{ width: 150 }} onClick={() => navigate("/stake")}>
            Stake
          </HereButton>
        </div>
      </BalanceCard>

      <TokensCard>
        <H3 style={{ marginBottom: 4 }}>Portfolio</H3>

        {Object.values(tokens)
          .sort((a, b) => usd(b) - usd(a))
          .map((ft) => (
            <TokenCard key={ft.symbol}>
              <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  style={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    objectFit: "contain",
                    borderRadius: 12,
                  }}
                  src={ft.image_url}
                />
                <div>
                  <Text style={{ fontWeight: "bold" }}>{ft.name}</Text>
                  <SmallText>
                    {ft.symbol} • ${ft.usd_rate || 0}
                  </SmallText>
                </div>
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                <Text style={{ fontWeight: "bold" }}>${Formatter.round(usd(ft), 2)}</Text>
                <SmallText>
                  {formatAmount(ft.amount || "0", ft.decimal, 2)} {ft.symbol}
                </SmallText>
              </div>
            </TokenCard>
          ))}
      </TokensCard>

      <Transactions data={trxs} />
    </Root>
  );
};

export default Home;
