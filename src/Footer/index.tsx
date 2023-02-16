import React from "react";
import * as S from "./styled";

// @ts-ignore
import AppStore from "../assets/appstore.svg";
// @ts-ignore
import GooglePlay from "../assets/googleplay.svg";
import { isAndroid, isIOS } from "../utilts";

const Footer = () => {
  return (
    <S.Footer>
      <img src={require("../assets/nearhere.png")} alt="nearhere" />

      <S.Appstore>
        {isAndroid() && (
          <a href="https://play.google.com/store/apps/details?id=com.herewallet">
            <GooglePlay style={{ height: 48, marginBottom: 8 }} />
          </a>
        )}

        {isIOS() && (
          <a href="https://appstore.herewallet.app/web">
            <AppStore />
          </a>
        )}

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
