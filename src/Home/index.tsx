import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { groupBy } from "lodash";

import { H3, Text } from "../uikit";
import { SmallText, H2, BoldP } from "../uikit/typographic";
import { ActionButton, Button, HereButton } from "../uikit/button";
import { colors } from "../uikit/theme";
import Icon from "../uikit/Icon";

import { useWallet } from "../core/Accounts";
import { Formatter, truncateAddress } from "../core/helpers";
import { isTgMobile } from "../Mobile";

import { Root, Container, Card, TokenCard, Tabs, Tab, TokensRow, TokenIcon, TokenAction, NftCard, NftsGrid, RightContainer, AppIcon, RecentlyApp } from "./styled";
import { Transaction } from "./Transactions";
import Header from "./Header";
import { notify } from "../core/toast";
import Widgets from "./HOT/Widgets";
import { HereError } from "../core/network/types";

const LinkButtonStyle = { textDecoration: "none", marginTop: "auto", marginBottom: 4, flex: 1 };

const Home = () => {
  const navigate = useNavigate();
  const account = useWallet()!;
  const [showAll, setShowAll] = useState(false);
  const [showTokens, toggleTokens] = useState(true);
  const [isNftsLoading, setNftsLoading] = useState(false);
  const [isReserving, setReserving] = useState(false);

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
          {isTgMobile() && (
            <div style={{ marginTop: 4, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <BoldP>{truncateAddress(account.near.accountId)}</BoldP>
              <Icon
                name="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(account.near.accountId);
                  notify("Account address has beed copied");
                }}
              />
            </div>
          )}

          <Card style={{ gap: 16 }}>
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: isTgMobile() ? "flex-start" : "flex-end", flexDirection: isTgMobile() ? "column" : "row" }}>
              <div>
                <SmallText style={{ color: colors.blackSecondary }}>Total Balance</SmallText>
                <H2>${Formatter.round(account.tokens.stats.all, 2)}</H2>
              </div>

              <div style={{ marginTop: isTgMobile() ? 16 : 0, width: isTgMobile() ? "100%" : 300, marginLeft: "auto", display: "flex", gap: 16 }}>
                <HereButton onClick={() => window.Telegram.WebApp.openLink("https://onramp.money/experience/near/")} style={LinkButtonStyle}>
                  Buy NEAR
                </HereButton>

                <HereButton onClick={() => navigate("/transfer")} style={LinkButtonStyle}>
                  Transfer
                </HereButton>
              </div>
            </div>

            {account.transactions.list.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <SmallText style={{ color: colors.blackSecondary }}>Recent transactions</SmallText>

                  {account.transactions.list.length > 2 && (
                    <>
                      {!showAll ? (
                        <Button style={{ marginRight: -8 }} onClick={() => setShowAll(true)}>
                          <SmallText style={{ fontWeight: "bold", color: "var(--Black-Primary)" }}>See all</SmallText>
                          <Icon name="cursor-right" />
                        </Button>
                      ) : (
                        <Button style={{ marginRight: -4 }} onClick={() => setShowAll(false)}>
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

          {isTgMobile() && !account.hot.needRegister && <Widgets />}
          {isTgMobile() && account.hot.needRegister && (
            <div
              style={{
                borderRadius: 20,
                backgroundImage: `url(${require("../assets/hot/hot-banner-bg.png")})`,
                backgroundSize: "cover",
                backgroundPosition: "100% 100%",
                border: "1px solid var(--Black-Primary, #2C3034)",
                backgroundColor: "#101112",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                width: "100%",
                padding: 16,
                height: 173,
              }}
            >
              <BoldP style={{ color: "#fff", fontSize: 20, lineHeight: "26px" }}>
                Claim your
                <br />
                First Hot Token!
              </BoldP>

              <ActionButton onClick={() => navigate("/hot/onboard")} style={{ marginTop: "auto", background: "#fff", borderRadius: 16, color: colors.blackPrimary, width: 160, height: 40 }}>
                Claim
              </ActionButton>

              <img style={{ position: "absolute", bottom: 0, right: 0, width: 133, height: 133 }} src={require("../assets/hot/hot-banner-img.png")} />
            </div>
          )}

          {!isTgMobile() && (
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
                <div style={{ width: "100%" }}>
                  {account.metamaskNftCanReserve && (
                    <div style={{ width: "100%", maxWidth: 400, border: "1px solid var(--Stroke)", marginBottom: 24, marginTop: 16, padding: 16, borderRadius: 16 }}>
                      <Text>Claim Meta-NFT if you didn't get it due to .near address allocation issues</Text>
                      <ActionButton
                        style={{ marginTop: 16, width: "100%" }}
                        disabled={isReserving}
                        onClick={async () => {
                          try {
                            setReserving(true);
                            await account.reserveMetaNft();
                            notify("Nft has been claimed. This will appear some time after the page is reloaded.");
                            setReserving(false);
                          } catch (e) {
                            setReserving(false);
                            notify(e instanceof HereError ? e.body : e?.toString?.() || "");
                          }
                        }}
                      >
                        Claim Meta-NFT
                      </ActionButton>
                    </div>
                  )}

                  <NftsGrid style={{ display: "block" }}>
                    {Object.values(groupBy(account.nfts, (t) => t.collection_name)).map((group) => (
                      <div style={{ marginTop: 24 }}>
                        <BoldP style={{ width: "100%" }}> {group[0].collection_name}</BoldP>
                        <NftsGrid style={{ marginTop: 18 }}>
                          {group.map((nft) => (
                            <a style={{ textDecoration: "none", overflow: "hidden" }} rel="noopener noreferrer" href={`https://www.tradeport.xyz/near/collection/${nft.contract_id}`} target="_blank">
                              <NftCard key={nft.nft_id} src={nft.media_url} />
                              <BoldP style={{ marginTop: 4, textOverflow: "ellipsis", overflow: "hidden" }}>{nft.nft_title}</BoldP>
                            </a>
                          ))}
                        </NftsGrid>
                      </div>
                    ))}
                  </NftsGrid>
                </div>
              )}
            </Card>
          )}

          {isTgMobile() && (
            <>
              <BoldP style={{ color: colors.blackSecondary }}>Portfolio</BoldP>
              <Card style={{ marginTop: -8, padding: "0" }}>
                <TokenCard style={{ height: 72, padding: "0 16px", display: "flex" }} onClick={() => (account.hot.needRegister ? navigate("/hot/onboard") : navigate("/hot"))}>
                  <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 12 }}>
                    <TokenIcon src={require("../assets/hot/hot-icon.png")} />

                    <div style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold" }}>HOT</Text>
                      <SmallText>{Math.max(0, account.hot.balance).toFixed(2)}</SmallText>
                    </div>

                    {account.hot.needRegister ? (
                      <>
                        <BoldP>Claim 0.01 (free)</BoldP>
                        <Icon name="arrow-right" />
                      </>
                    ) : (
                      <Icon name="arrow-right" />
                    )}
                  </div>
                </TokenCard>

                {Object.values(account.tokens.tokens)
                  .filter((t) => t.amountFloat > 0 || t.symbol === "NEAR")
                  .sort((a, b) => account.tokens.fiat(b) - account.tokens.fiat(a))
                  .map((ft) => {
                    if (ft.symbol === "HOT") return null;
                    // const cur = account.tokens.cur(ft);
                    // const diff = Formatter.round(cur.usd_24h_change - 1);
                    // const diffColor = diff === 0 ? colors.blackSecondary : diff > 0 ? colors.green : colors.red;

                    return (
                      <TokenCard key={ft.symbol} style={{ height: 72, padding: "0 16px", display: "flex" }}>
                        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 12 }}>
                          <TokenIcon src={ft.icon} />

                          <div style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "bold" }}>{ft.name}</Text>
                            <SmallText>${account.tokens.usd(ft) || 0}</SmallText>
                          </div>

                          <div style={{ flex: 1, textAlign: "right" }}>
                            <Text style={{ fontWeight: "bold" }}>${Formatter.round(account.tokens.fiat(ft), 2)}</Text>
                            <SmallText>
                              {ft.amountFloat} {ft.symbol}
                            </SmallText>
                          </div>
                        </div>
                      </TokenCard>
                    );
                  })}
              </Card>
            </>
          )}
        </div>

        {!isTgMobile() && (
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
              <div style={{ display: "flex", marginBottom: 12, width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                <H3>Recent Apps</H3>
                <Button onClick={() => navigate("/apps")}>
                  <Text style={{ fontWeight: "bold", color: "var(--Black-Secondary)" }}>See all</Text>
                  <Icon name="cursor-right" />
                </Button>
              </div>

              {account.recentlyApps.slice(0, 6).map((app) => (
                <RecentlyApp as="a" rel="noopener noreferrer" href={`https://nearblocks.io/address/${app.contract_id}`} target="_blank">
                  <AppIcon src={app.image} />
                  <BoldP style={{ overflowX: "hidden" }}>{app.name}</BoldP>
                  <Icon style={{ marginLeft: "auto" }} name="cursor-right" />
                </RecentlyApp>
              ))}
            </Card>
          </RightContainer>
        )}
      </Container>
    </Root>
  );
};

export default observer(Home);
