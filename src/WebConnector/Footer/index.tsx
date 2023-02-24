import React from "react";
import AppStore from "jsx:../../assets/appstore.svg";
import GooglePlay from "jsx:../../assets/googleplay.svg";
import { isAndroid, isIOS } from "../../core/helpers";
import { APP_STORE, GOOGLE_PLAY } from "../../core/constants";
import * as S from "./styled";

const Buttons = () => {
  if (isAndroid())
    return (
      <a href={GOOGLE_PLAY}>
        <GooglePlay />
      </a>
    );

  if (isIOS())
    return (
      <a href={APP_STORE}>
        <AppStore />
      </a>
    );

  return (
    <S.Flexbox>
      <a href={APP_STORE}>
        <AppStore />
      </a>

      <a href={GOOGLE_PLAY}>
        <GooglePlay />
      </a>
    </S.Flexbox>
  );
};

const Footer = () => {
  return (
    <S.Footer>
      <img src={require("../../assets/nearhere.png")} alt="nearhere" />

      <S.Appstore>
        <Buttons />

        <p>
          Don’t have an account yet? Visit&nbsp;
          <a href="https://herewallet.app">herewallet.app</a>
        </p>
      </S.Appstore>

      <img src={require("../../assets/rock.png")} alt="rock" />
    </S.Footer>
  );
};

export default Footer;
