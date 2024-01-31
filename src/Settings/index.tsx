import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import Header from "../Home/Header";
import { Card, Root } from "../Home/styled";
import { ActionButton, Button, H2, Text } from "../uikit";
import { AvatarImage } from "../Home/Header/styled";
import { H3, TinyText } from "../uikit/typographic";
import { colors } from "../uikit/theme";
import Icon from "../uikit/Icon";

import { useNavigateBack } from "../useNavigateBack";
import { accounts, useWallet } from "../core/Accounts";
import { ReceiverFetcher } from "../core/Receiver";
import { storage } from "../core/Storage";
import { notify } from "../core/toast";
import { isTgMobile } from "../env";

import { Container, Menu, SensitiveCard } from "./styled";

const Settings = () => {
  useNavigateBack();
  const user = useWallet()!;
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    ReceiverFetcher.shared.getAvatar(user.id, user.type).then(setAvatar);
  }, [user.id]);

  return (
    <Root>
      {!isTgMobile() && <Header />}

      <Container>
        {!isTgMobile() && (
          <div style={{ gridArea: "navigation" }}>
            <Link to="/" replace style={{ textDecoration: "none", display: "inline-block" }}>
              <Button $id="Settings.back" style={{ gap: 8 }}>
                <Icon name="arrow-left" />
                <H2>Settings</H2>
              </Button>
            </Link>
          </div>
        )}

        <Menu>
          {!isTgMobile() && (
            <Button $id="Settings.general" $active={location.pathname === "/settings/general"} onClick={() => navigate("/settings/general")}>
              <Icon style={{ width: 24, height: 24 }} name="user" />
              <Text>General</Text>
            </Button>
          )}

          {!!storage.getAccount(user.id)?.privateKey && (
            <Button $id="Settings.seedphrase" $active={location.pathname === "/settings/passphrase"} onClick={() => navigate("/settings/passphrase")}>
              <Icon name="document" />
              <Text>Seedphrase</Text>
            </Button>
          )}

          <Button $id="Settings.support" $active={location.pathname === "/settings/support"} onClick={() => navigate("/settings/support")}>
            <Icon style={{ background: "#95A7E833", borderRadius: 8 }} name="support" />
            <Text>Contact support</Text>
          </Button>
        </Menu>

        <Routes>
          {isTgMobile() ? (
            <Route path="/" element={<Navigate to="/settings/passphrase" replace />} />
          ) : (
            <>
              <Route path="/" element={<Navigate to="/settings/general" replace />} />
              <Route
                path="/general"
                element={
                  <Card style={{ gridArea: "content", gap: 40, height: "fit-content" }}>
                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                      <AvatarImage as={avatar ? "img" : "div"} src={avatar} style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 16 }} />

                      <div
                        style={{
                          maxWidth: 360,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ lineBreak: "anywhere" }}>{user.id}</Text>
                        <TinyText style={{ marginTop: 4, lineHeight: "16px" }}>
                          You can change your avatar in the app.{" "}
                          <a style={{ color: colors.blackSecondary }} href="https://download.herewallet.app">
                            <TinyText as="span">Download HERE</TinyText>
                          </a>
                        </TinyText>
                      </div>
                    </div>

                    {/* {user.id.endsWith(".near") && (
              <div>
                <H2>Nickname</H2>
                <Text>Nickname is an alternative to the long wallet address. Send tokens only to this address</Text>
                <HereInput disabled value={user.id} />

                <TinyText>
                  To change nickname you will need to create new account. If you also want to transfer score to your new
                  account, please contact support.
                </TinyText>
              </div>)}

               <div style={{ display: "flex", flexDirection: "column", width: 343, gap: 16 }}>
                <div>
                  <H3>NEAR Social</H3>
                  <Text>Adjust your info on NEAR Social straight from HERE Web</Text>
                </div>

                <HereInput value={name} onChange={(e) => setName(e.target.value)} label="Name" />
                <HereInput
                  style={{ height: 100 }}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  multiline
                  label="About"
                />
              </div> */}
                  </Card>
                }
              />
            </>
          )}

          <Route
            path="/passphrase"
            element={
              <Card style={{ gridArea: "content", gap: 24 }}>
                <div
                  style={{
                    background: "#EFDCCC",
                    border: "1px solid #fff",
                    borderColor: "#DB8520",
                    borderRadius: 12,
                    display: "flex",
                    padding: 8,
                    gap: 8,
                  }}
                >
                  <Icon style={{ flexShrink: 0 }} name="warning" />
                  <Text style={{ color: "#DB8520" }}>Do not share your passphrase or private key with anyone, even with us!</Text>
                </div>

                <div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <H3>Private key</H3>
                    <Button
                      $id="Settings.privateKeyCopy"
                      onClick={async () => {
                        await navigator.clipboard.writeText(storage.getAccount(user.id)?.privateKey || "");
                        notify("Private key has beed copied");
                      }}
                    >
                      <Icon name="copy" />
                    </Button>
                  </div>
                  <SensitiveCard style={{ maxWidth: 460, width: "100%", lineBreak: "anywhere" }}>{storage.getAccount(user.id)?.privateKey}</SensitiveCard>
                </div>

                {!!storage.getAccount(user.id)?.seed && (
                  <div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <H3>Passphrase</H3>
                      <Button
                        $id="Settings.passphraseCopy"
                        onClick={async () => {
                          await navigator.clipboard.writeText(storage.getAccount(user.id)?.seed || "");
                          notify("Passphrase has beed copied");
                        }}
                      >
                        <Icon name="copy" />
                      </Button>
                    </div>
                    <SensitiveCard>{storage.getAccount(user.id)?.seed}</SensitiveCard>
                  </div>
                )}
              </Card>
            }
          />

          <Route path="/password" element={<Card style={{ gridArea: "content", gap: 40 }}></Card>} />
          <Route
            path="/support"
            element={
              <Card style={{ gridArea: "content", gap: 24 }}>
                <div>
                  <H3>Write to us</H3>
                  <Text>Our support will try to solve your problem as soon as possible.</Text>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <ActionButton $id="Settings.support.tg" style={{ flex: 1 }} onClick={() => window.Telegram.WebApp.openTelegramLink("https://t.me/heresupport")}>
                    Telegram
                  </ActionButton>
                </div>
              </Card>
            }
          />
        </Routes>

        {/* {isTgMobile() && (
          <Menu>
            <Button
              $id="Settings.logout"
              style={{ background: "rgba(214, 62, 62, 0.15)" }}
              $active={location.pathname === "/settings/support"}
              onClick={() => {
                window.Telegram.WebApp.showConfirm(
                  "Are you sure you want to log out of your account? Make sure you save the seed phrase, otherwise you will lose access to your account!",
                  (is: boolean) => is && accounts.disconnect(user.id)
                );
              }}
            >
              <Icon style={{ background: "rgba(214, 62, 62, 0.15)" }} name="logout" />
              <Text style={{ color: "rgba(214, 62, 62, 1)" }}>Logout</Text>
            </Button>
          </Menu>
        )} */}
      </Container>
    </Root>
  );
};

export default observer(Settings);
