import React from "react";
import { APP_STORE, GOOGLE_PLAY, HERE_STORAGE_DOCS } from "../core/constants";
import { useAnalytics } from "../core/analytics";
import UserAccount from "../core/UserAccount";
import { Button, Text } from "../uikit";

export const TipClaim = ({ user }: { user: UserAccount }) => {
  const track = useAnalytics("tip_claim", user);
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>Interest is accrued every day. Claim it every day to increase staked balance.
      </Text>
      <div style={{ display: "flex", gap: 12 }}>
        <Button style={{ marginTop: 8 }} onClick={() => tips.hideTipClaim()}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>Got it</Text>
        </Button>
        <Button
          as="a"
          target="_blank"
          href={HERE_STORAGE_DOCS}
          style={{ marginTop: 8, marginLeft: 16 }}
          onClick={() => track("learn_more")}
        >
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Learn more</Text>
        </Button>
      </div>
    </>
  );
};

export const TipInstallApp = ({ user }: { user: UserAccount }) => {
  const track = useAnalytics("tip_install_app", user);
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>In the HERE app you can make transfers without unstaking.
      </Text>

      <div style={{ display: "flex", gap: 12 }}>
        <Button as="a" target="_blank" style={{ marginTop: 8 }} href={APP_STORE} onClick={() => track("app_store")}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>AppStore</Text>
        </Button>
        <Button as="a" target="_blank" style={{ marginTop: 8 }} onClick={() => track("google_play")} href={GOOGLE_PLAY}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>GooglePlay</Text>
        </Button>
        <Button style={{ marginTop: 8 }} onClick={() => tips.hideTipInstallApp()}>
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Hide</Text>
        </Button>
      </div>
    </>
  );
};

export const TipUnstake = ({ user }: { user: UserAccount }) => {
  const track = useAnalytics("tip_unstake", user);
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>In the HERE app you can make transfers without unstaking.
      </Text>

      <div style={{ display: "flex", gap: 12 }}>
        <Button as="a" target="_blank" style={{ marginTop: 8 }} href={APP_STORE} onClick={() => track("app_store")}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>AppStore</Text>
        </Button>
        <Button as="a" target="_blank" style={{ marginTop: 8 }} onClick={() => track("google_play")} href={GOOGLE_PLAY}>
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>GooglePlay</Text>
        </Button>
        <Button style={{ marginTop: 8 }} onClick={() => tips.hideTipUnstake()}>
          <Text style={{ fontWeight: "bolder", color: "#2C3034" }}>Hide</Text>
        </Button>
      </div>
    </>
  );
};

export const TipBuyNFT = ({ user, onClose }: { user: UserAccount; onClose?: () => void }) => {
  const track = useAnalytics("tip_buy_nft", user);
  const tips = user.near.hnear.tips;

  return (
    <>
      <Text>
        <b>Tip: </b>The less you use withdraw from staking the more APY you will get. Also, HERE NFT will give you +1%
      </Text>

      <div style={{ display: "flex", gap: 12 }}>
        <Button
          as="a"
          target="_blank"
          href="https://www.tradeport.xyz/near/collection/nft.herewallet.near/"
          style={{ marginTop: 8 }}
          onClick={() => track("buy_nft")}
        >
          <Text style={{ fontWeight: "bolder", color: "#0258F7" }}>Buy NFT</Text>
        </Button>
        <Button
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
