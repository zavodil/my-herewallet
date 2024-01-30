import React from "react";
import { APP_STORE, GOOGLE_PLAY, HERE_STORAGE_DOCS } from "../core/constants";
import UserAccount from "../core/UserAccount";
import { Button, Text } from "../uikit";

export const TipClaim = ({ user }: { user: UserAccount }) => {
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>Interest is accrued every day. Claim it every day to increase staked balance.
      </Text>
      <div style={{ display: "flex", gap: 12 }}>
        <Button $id="TipClaim.hide" style={{ marginTop: 8 }} onClick={() => tips.hideTipClaim()}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>Got it</Text>
        </Button>
        <Button $id="TipClaim.learnMore" as="a" target="_blank" href={HERE_STORAGE_DOCS} style={{ marginTop: 8, marginLeft: 16 }}>
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Learn more</Text>
        </Button>
      </div>
    </>
  );
};

export const TipInstallApp = ({ user }: { user: UserAccount }) => {
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>In the HERE app you can make transfers without unstaking.
      </Text>

      <div style={{ display: "flex", gap: 12 }}>
        <Button $id="TipInstall.appStore" as="a" target="_blank" style={{ marginTop: 8 }} href={APP_STORE}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>AppStore</Text>
        </Button>
        <Button $id="TipInstall.googlePlay" as="a" target="_blank" style={{ marginTop: 8 }} href={GOOGLE_PLAY}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>GooglePlay</Text>
        </Button>
        <Button $id="TipInstall.hide" style={{ marginTop: 8 }} onClick={() => tips.hideTipInstallApp()}>
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Hide</Text>
        </Button>
      </div>
    </>
  );
};

export const TipUnstake = ({ user }: { user: UserAccount }) => {
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>In the HERE app you can make transfers without unstaking.
      </Text>

      <div style={{ display: "flex", gap: 12 }}>
        <Button $id="TipUnstake.appStore" as="a" target="_blank" style={{ marginTop: 8 }} href={APP_STORE}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>AppStore</Text>
        </Button>
        <Button $id="TipUnstake.googlePlay" as="a" target="_blank" style={{ marginTop: 8 }} href={GOOGLE_PLAY}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>GooglePlay</Text>
        </Button>
        <Button $id="TipUnstake.hide" style={{ marginTop: 8 }} onClick={() => tips.hideTipUnstake()}>
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Hide</Text>
        </Button>
      </div>
    </>
  );
};

export const TipBuyNFT = ({ user, onClose }: { user: UserAccount; onClose?: () => void }) => {
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>The less you use withdraw from staking the more APY you will get. Also, HERE NFT will give you +1%
      </Text>

      <div style={{ display: "flex", gap: 12 }}>
        <Button $id="TipBuyNFT.buy" as="a" target="_blank" href="https://www.tradeport.xyz/near/collection/nft.herewallet.near/" style={{ marginTop: 8 }}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>Buy NFT</Text>
        </Button>
        <Button
          $id="TipBuyNFT.hide"
          style={{ marginTop: 8, marginLeft: 16 }}
          onClick={() => {
            onClose?.();
            tips.hideTipNFT();
          }}
        >
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Hide</Text>
        </Button>
      </div>
    </>
  );
};
