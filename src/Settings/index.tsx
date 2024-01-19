import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import Header from "../Home/Header";
import { Card, Root } from "../Home/styled";
import { ActionButton, Button, H2, Text } from "../uikit";
import Icon from "../uikit/Icon";

import { accounts, useWallet } from "../core/Accounts";
import { Container, Menu, SensitiveCard } from "./styled";
import { AvatarImage } from "../Home/Header/styled";
import { H3, TinyText } from "../uikit/typographic";
import { colors } from "../uikit/theme";
import { storage } from "../core/Storage";
import { ConnectType } from "../core/types";
import { notify } from "../core/toast";

const Settings = () => {
  const user = useWallet()!;
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    accounts.getAvatar(user.id, user.type).then(setAvatar);
  }, [user.id]);

  return (
    <Root>
      <Header />

      <Container>
        <div style={{ gridArea: "navigation" }}>
          <Link to="/" replace style={{ textDecoration: "none", display: "inline-block" }}>
            <Button style={{ gap: 8 }}>
              <Icon name="arrow-left" />
              <H2>Settings</H2>
            </Button>
          </Link>
        </div>

        <Menu>
          <Button $active={location.pathname === "/settings/general"} onClick={() => navigate("/settings/general")}>
            <Icon name="user" />
            <Text>General</Text>
          </Button>
          {user.type === ConnectType.Web && (
            <>
              <Button
                $active={location.pathname === "/settings/passphrase"}
                onClick={() => navigate("/settings/passphrase")}
              >
                <Icon name="document" />
                <Text>Seed phrase</Text>
              </Button>
              {/* <Button
                $active={location.pathname === "/settings/password"}
                onClick={() => navigate("/settings/password")}
              >
                <Icon name="key" />
                <Text>Password</Text>
              </Button> */}
            </>
          )}

          <Button $active={location.pathname === "/settings/support"} onClick={() => navigate("/settings/support")}>
            <Icon style={{ background: "#95A7E833" }} name="support" />
            <Text>Contact support</Text>
          </Button>
        </Menu>

        <Routes>
          <Route path="/" element={<Navigate to="/settings/general" replace />} />
          <Route
            path="/general"
            element={
              <Card style={{ gridArea: "content", gap: 40, height: "fit-content" }}>
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <AvatarImage
                    as={avatar ? "img" : "div"}
                    src={avatar}
                    style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 16 }}
                  />

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

                <Button onClick={() => accounts.disconnect(user.id)}>Logout</Button>

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

          <Route
            path="/passphrase"
            element={
              <Card style={{ gridArea: "content", gap: 24 }}>
                <div
                  style={{
                    background: "#EFDCCC",
                    padding: 8,
                    borderRadius: 12,
                    border: "1px solid #fff",
                    borderColor: "#DB8520",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <Icon name="warning" />
                  <Text style={{ color: "#DB8520" }}>
                    Do not share your passphrase or private key with anyone, even with us!
                  </Text>
                </div>

                <div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <H3>Private key</H3>
                    <Button
                      onClick={async () => {
                        await navigator.clipboard.writeText(storage.getAccount(user.id)?.privateKey || "");
                        notify("Private key has beed copied");
                      }}
                    >
                      <Icon name="copy" />
                    </Button>
                  </div>
                  <SensitiveCard style={{ maxWidth: 460, width: "100%", lineBreak: "anywhere" }}>
                    {storage.getAccount(user.id)?.privateKey}
                  </SensitiveCard>
                </div>

                <div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <H3>Passphrase</H3>
                    <Button
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
                  <ActionButton style={{ flex: 1 }} as="a" href="https://t.me/heresupport">
                    Telegram
                  </ActionButton>
                  <ActionButton style={{ flex: 1 }} as="a" href="https://discord.com/invite/8Q3gw3gsD2">
                    Discord
                  </ActionButton>
                </div>
              </Card>
            }
          />
        </Routes>
      </Container>
    </Root>
  );
};

export default observer(Settings);
