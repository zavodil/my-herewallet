import React from "react";
import * as S from "./styled";

// @ts-ignore
import AppStore from "../assets/appstore.svg";

export const appStore = (network: string) => {
  return network === "mainnet"
    ? "https://appstore.herewallet.app/web"
    : "https://testflight.apple.com/join/LwvGXAK8";
};

const Footer = ({ network }: { network: string }) => {
  return (
    <S.Footer>
      <img src={require("../assets/nearhere.png")} alt="nearhere" />

      <S.Appstore>
        <a href={appStore(network)}>
          <AppStore />
        </a>

        <p>
          Don’t have an account yet? Visit&nbsp;
          <a href="https://herewallet.app">herewallet.app</a>
        </p>
      </S.Appstore>

      <img src={require("../assets/rock.png")} alt="rock" />
    </S.Footer>
  );
};

export default Footer;
