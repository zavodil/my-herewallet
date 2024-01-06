import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import introImage from "../assets/intro.png";
import { accounts } from "../core/Accounts";

import { H1, Text } from "../uikit/typographic";
import { ActionButton, ActivityIndicator } from "../uikit";
import HereInput from "../uikit/Input";

import { Card, IntroImage, Page, Root } from "./styled";
import Header from "../Home/Header";

const ImportAccount = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [isCreating, setCreating] = useState(false);

  return (
    <Root>
      <Header />

      <Page>
        <IntroImage>
          <img src={introImage} />
          <img src={introImage} />
        </IntroImage>

        <Card style={{ width: "100%", maxWidth: 480, gap: 48 }}>
          <div>
            <H1>
              Log in with passphrase
              <br />
              or private key{" "}
            </H1>
            <Text style={{ marginTop: 8 }}>
              Enter the backup passphrase or private key associated with the account.
            </Text>
          </div>

          <div style={{ position: "relative" }}>
            <HereInput
              multiline
              label="Seed or private key"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              style={{ height: 100 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <ActionButton
              style={{ flex: 1 }}
              disabled={!value || isCreating}
              onClick={() => {
                if (isCreating) return;
                setCreating(true);
                accounts
                  .importAccount({ seed: value })
                  .then(() => navigate("/"))
                  .finally(() => setCreating(false));
              }}
            >
              {isCreating ? <ActivityIndicator width={6} style={{ transform: "scale(0.5)" }} /> : "Continue"}
            </ActionButton>
          </div>
        </Card>
      </Page>
    </Root>
  );
};

export default observer(ImportAccount);
