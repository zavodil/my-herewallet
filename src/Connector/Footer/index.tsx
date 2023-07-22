import React from "react";
import AppStore from "../../assets/appstore.svg";
import GooglePlay from "../../assets/googleplay.svg";
import { isAndroid, isIOS } from "../../helpers";
import { APP_STORE, GOOGLE_PLAY } from "../../Staking/core/constants";
import nearhereImage from "../../assets/nearhere.png";
import rockImage from "../../assets/rock.png";
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
      <img src={nearhereImage} alt="nearhere" />

      <S.Appstore>
        <Buttons />

        <p>
          Don’t have an account yet? Visit&nbsp;
          <a href="https://herewallet.app">herewallet.app</a>
        </p>
      </S.Appstore>

      <img src={rockImage} alt="rock" />
    </S.Footer>
  );
};

export default Footer;
