import React from "react";
import crypto from "crypto";
import { Root } from "./Home/styled";
import { BoldP, SmallText } from "./uikit/typographic";
import { SensitiveCard } from "./Settings/styled";
import { decryptText } from "./core/Storage";
import Icon from "./uikit/Icon";
import { Button } from "./uikit";
import { colors } from "./uikit/theme";
import { notify } from "./core/toast";

const hidden = ["eruda-sources", "prices", ":cache", "eruda-resources", "near-wallet-selector:recentlySignedInWallets", "eruda-console", "eruda-elements", "eruda-entry-button", "eruda-dev-tools"];

const StorageView = () => {
  const storage = { ...localStorage };

  return (
    <Root style={{ padding: 16 }}>
      {Object.entries(storage).map(([key, value]) => {
        if (hidden.includes(key) || key.endsWith(":cache")) return null;

        let data = null;
        try {
          data = JSON.parse(decryptText(value, "dz_3!R$%2pdf~"));
        } catch {
          try {
            const salt = crypto.createHash("sha256").update(key).digest().toString("hex");
            data = JSON.parse(decryptText(value, "dz_3!R$%2pdf~" + salt));
          } catch {}
        }

        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <BoldP style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{key}</BoldP>
            <SensitiveCard style={{ width: "100%", maxHeight: 300, overflowX: "hidden", overflowY: "auto" }}>
              {data != null &&
                Object.entries(data).map(([k, val]) => {
                  if (k === "jwt") return null;
                  return (
                    <div key={k} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex" }}>
                        <SmallText>{k}:</SmallText>
                        <Button
                          $id="copyStorage"
                          onClick={async () => {
                            await navigator.clipboard.writeText(typeof val === "string" ? val : JSON.stringify(val));
                            notify("Seedphrase has beed copied");
                          }}
                        >
                          <Icon viewBox="0 0 24 24" width={16} height={16} name="copy" />
                        </Button>
                      </div>

                      <SmallText style={{ fontWeight: "bold", color: colors.blackPrimary }}>{JSON.stringify(val)}</SmallText>
                    </div>
                  );
                })}

              {data == null && <SmallText style={{ lineBreak: "anywhere", fontWeight: "bold", color: colors.blackPrimary }}>{value}</SmallText>}
            </SensitiveCard>
          </div>
        );
      })}

      <div style={{ flexShrink: 0, height: 200, width: "100%" }}></div>
    </Root>
  );
};

export default StorageView;
