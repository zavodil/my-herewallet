import React from "react";
import { observer } from "mobx-react-lite";

import { notify } from "./core/toast";
import { storage } from "./core/Storage";
import { Button, H3, H4, Text } from "./uikit";
import Icon from "./uikit/Icon";

import { SensitiveCard } from "./Settings/styled";
import { Root } from "./Home/styled";

const TechnicalBreak = () => {
  const seed = storage.getAccount(storage.read()?.activeAccount!)?.seed;

  return (
    <Root style={{ textAlign: "center", justifyContent: "center", padding: 24, alignItems: "center" }}>
      <img src={require("./assets/hot/hot-blur.png")} style={{ position: "fixed", width: "100vw", top: -100, height: "100vh", objectFit: "contain" }} />

      <div style={{ marginTop: "auto", zIndex: 1000 }}>
        <img style={{ width: 164 }} src={require("./assets/error.png")} />
        <H4 style={{ marginTop: 24 }}>Technical break</H4>
        <Text>We're scaling the wallet infrastructure.</Text>
        <Text>The app will be available in 10 min.</Text>
      </div>

      <div style={{ marginTop: "auto", width: "100%", zIndex: 1000 }}>
        {seed != null && (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <H3>Passphrase</H3>
              <Button
                $id="Settings.passphraseCopy"
                onClick={async () => {
                  await navigator.clipboard.writeText(seed!);
                  notify("Passphrase has beed copied");
                }}
              >
                <Icon name="copy" />
              </Button>
            </div>

            <SensitiveCard>{seed}</SensitiveCard>
          </>
        )}
      </div>
    </Root>
  );
};

export default observer(TechnicalBreak);
