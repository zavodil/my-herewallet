import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { groupBy } from "lodash";

import { H3, Text } from "../uikit";
import { SmallText, H2, BoldP } from "../uikit/typographic";
import { Button, HereButton } from "../uikit/button";
import { colors } from "../uikit/theme";
import Icon from "../uikit/Icon";

import { useWallet } from "../core/Accounts";
import { Formatter } from "../core/helpers";

import {
  Root,
  Container,
  Card,
  TokenCard,
  Tabs,
  Tab,
  TokensRow,
  TokenIcon,
  TokenAction,
  NftCard,
  NftsGrid,
  RightContainer,
  AppIcon,
  RecentlyApp,
} from "./styled";
import { Transaction } from "./Transactions";
import Header from "./Header";
import { toJS } from "mobx";

const LinkButtonStyle = { textDecoration: "none", marginTop: "auto", marginBottom: 4 };

const Home = () => {
  const navigate = useNavigate();
  const account = useWallet()!;
  const [showAll, setShowAll] = useState(false);
  const [showTokens, toggleTokens] = useState(true);

  const [isNftsLoading, setNftsLoading] = useState(false);
  const selectNfts = async () => {
    toggleTokens(false);
    if (isNftsLoading) return;
    if (account.nfts.length > 0) return;
    setNftsLoading(true);
    await account.fetchNfts().catch(() => {});
    setNftsLoading(false);
  };

  return (
    <Root>
      <Header />

      <Container>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 20 }}>
          <Card style={{ gap: 16 }}>
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <SmallText style={{ color: colors.blackSecondary }}>Total Balance</SmallText>
                <H2>${Formatter.round(account.tokens.stats.all, 2)}</H2>
              </div>

              <HereButton
                style={{ ...LinkButtonStyle, marginLeft: "auto", width: 150 }}
                onClick={() => navigate("/transfer")}
              >
                Transfer
              </HereButton>
            </div>

            {account.transactions.list.length > 0 && (
              <div>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
                >
                  <SmallText style={{ color: colors.blackSecondary }}>Recent transactions</SmallText>

                  {account.transactions.list.length > 2 && (
                    <>
                      {!showAll ? (
                        <Button onClick={() => setShowAll(true)}>
                          <SmallText style={{ fontWeight: "bold", color: "var(--Black-Primary)" }}>See all</SmallText>
                          <Icon name="cursor-right" />
                        </Button>
                      ) : (
                        <Button onClick={() => setShowAll(false)}>
                          <SmallText style={{ fontWeight: "bold", color: "var(--Black-Primary)" }}>Hide all</SmallText>
                          <Icon name="cursor-down" />
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {account.transactions.list.slice(0, showAll ? 10 : 1).map((trx) => (
                  <Transaction key={trx.metadata.id} trx={trx} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <H3>Portfolio</H3>

            <Tabs style={{ marginTop: 16 }}>
              <Tab onClick={() => toggleTokens(true)} $active={showTokens}>
                Tokens
              </Tab>

              <Tab onClick={() => selectNfts()} $active={!showTokens}>
                NFTs
              </Tab>
            </Tabs>

            {showTokens && (
              <>
                <TokensRow>
                  <SmallText>Asset</SmallText>
                  <SmallText>Balance</SmallText>
                  <SmallText>Price</SmallText>
                  <SmallText style={{ textAlign: "right" }}>Actions</SmallText>
                </TokensRow>

                {Object.values(account.tokens.tokens)
                  .filter((t) => t.amountFloat > 0 || t.symbol === "NEAR")
                  .sort((a, b) => account.tokens.fiat(b) - account.tokens.fiat(a))
                  .map((ft) => {
                    const cur = account.tokens.cur(ft);
                    const diff = Formatter.round(cur.usd_24h_change - 1);
                    const diffColor = diff === 0 ? colors.blackSecondary : diff > 0 ? colors.green : colors.red;

                    return (
                      <TokenCard key={ft.symbol}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <TokenIcon src={ft.icon} />
                          <div>
                            <Text style={{ fontWeight: "bold" }}>{ft.name}</Text>
                            <SmallText>{ft.symbol}</SmallText>
                          </div>
                        </div>

                        <div>
                          <Text style={{ fontWeight: "bold" }}>${Formatter.round(account.tokens.fiat(ft), 2)}</Text>
                          <SmallText>
                            {ft.amountFloat} {ft.symbol}
                          </SmallText>
                        </div>

                        <div>
                          <Text>${account.tokens.usd(ft) || 0}</Text>
                          <SmallText style={{ color: diffColor }}>
                            {diff > 0 ? "+" : ""}
                            {diff}%
                          </SmallText>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <TokenAction onClick={() => navigate(`/transfer?asset=${ft.symbol}`)}>
                            <Icon name="arrow-right" />
                          </TokenAction>
                        </div>
                      </TokenCard>
                    );
                  })}
              </>
            )}

            {!showTokens && (
              <NftsGrid style={{ display: "block" }}>
                {Object.values(groupBy(account.nfts, (t) => t.collection_name)).map((group) => (
                  <div style={{ marginTop: 24 }}>
                    <BoldP style={{ width: "100%" }}> {group[0].collection_name}</BoldP>
                    <NftsGrid style={{ marginTop: 18 }}>
                      {group.map((nft) => (
                        <a
                          style={{ textDecoration: "none" }}
                          rel="noopener noreferrer"
                          href={`https://www.tradeport.xyz/near/collection/${nft.contract_id}`}
                          target="_blank"
                        >
                          <NftCard key={nft.nft_id} src={nft.media_url} />
                          <BoldP style={{ marginTop: 4 }}>{nft.nft_title}</BoldP>
                        </a>
                      ))}
                    </NftsGrid>
                  </div>
                ))}
              </NftsGrid>
            )}
          </Card>
        </div>

        <RightContainer>
          <Card style={{ padding: 16, width: "100%", height: 290 }}>
            <Tabs>
              <Tab $active>Swaps</Tab>
              <Tab>Bridge</Tab>
            </Tabs>

            <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: "var(--Black-Secondary)" }}>Coming soon</Text>
            </div>
          </Card>

          <Card style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                marginBottom: 12,
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <H3>Recent Apps</H3>
              <Button onClick={() => navigate("/apps")}>
                <Text style={{ fontWeight: "bold", color: "var(--Black-Secondary)" }}>See all</Text>
                <Icon name="cursor-right" />
              </Button>
            </div>

            {account.recentlyApps.slice(0, 6).map((app) => (
              <RecentlyApp
                as="a"
                rel="noopener noreferrer"
                href={`https://nearblocks.io/address/${app.contract_id}`}
                target="_blank"
              >
                <AppIcon src={app.image} />
                <BoldP style={{ overflowX: "hidden" }}>{app.name}</BoldP>
                <Icon style={{ marginLeft: "auto" }} name="cursor-right" />
              </RecentlyApp>
            ))}
          </Card>
        </RightContainer>
      </Container>
    </Root>
  );
};

export default observer(Home);
