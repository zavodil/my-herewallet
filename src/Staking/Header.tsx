import React, { useEffect } from "react";
import styled from "styled-components";
import LogoutIcon from "../assets/logout.svg";
import HereLogo from "../assets/here-logo.svg";
import TwitterIcon from "../assets/twitter.svg";
import DiscordIcon from "../assets/discord.svg";
import hereWebLogo from "../assets/here-web.svg?url";

import { StrokeButton } from "../uikit/button";
import { useWallet } from "../core/useWallet";
import { useAnalyticsTrack } from "../core/analytics";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, selectorModal } = useWallet();
  const track = useAnalyticsTrack("app");

  useEffect(() => {
    track("open", { from: document.referrer });
  }, []);

  useEffect(() => {
    if (user?.wallet.wallet == null) return;
    track("connect_wallet", { walletId: user.wallet.wallet.id });
  }, [user?.wallet.wallet]);

  const handleLogin = () => {
    if (user == null) return selectorModal?.show();
    user.wallet.wallet.signOut();
    track("logout");
  };

  return (
    <Wrap>
      <Link to="/" style={{ display: "flex" }}>
        <img style={{ height: 22, objectFit: "contain" }} src={hereWebLogo} />
      </Link>

      <Flex>
        <LinkButton href="https://twitter.com/here_wallet">
          <TwitterIcon style={{ width: 40, height: 40 }} />
        </LinkButton>
        <LinkButton href="https://discord.gg/8Q3gw3gsD2">
          <DiscordIcon style={{ width: 40, height: 40 }} />
        </LinkButton>

        <LogoutButton onClick={handleLogin}>
          <span style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
            {user?.wallet.accountId ?? "Connect wallet"}
          </span>
          {user?.wallet.accountId && selectorModal && (
            <LogoutIcon style={{ flexShrink: 0, marginLeft: 8 }} />
          )}
        </LogoutButton>
      </Flex>
    </Wrap>
  );
};

const LinkButton = styled.a`
  transition: 0.2s opacity;
  display: flex;
  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 576px) {
    display: none;
  }
`;

const LogoutButton = styled(StrokeButton)`
  height: 40px;
  width: 220px;
  overflow: hidden;

  @media (max-width: 576px) {
    padding: 0;
    border: none;
    width: 160px;
    border-radius: 0;
    justify-content: flex-end;
  }
`;

const Flex = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding: 0 10%;
  width: 100%;

  @media (max-width: 576px) {
    padding: 0 24px;
    height: 56px;
  }
`;

export default Header;
