import React from "react";
import { isAndroid, isIOS } from "../../core/helpers";
import { APP_STORE, GOOGLE_PLAY } from "../../core/constants";
import nearhereImage from "../../assets/nearhere.png";
import rockImage from "../../assets/rock.png";
import * as S from "./styled";

const Buttons = () => {
  if (isAndroid())
    return (
      <a href={GOOGLE_PLAY}>
        <img src={require("../../assets/googleplay.svg")} />
      </a>
    );

  if (isIOS())
    return (
      <a href={APP_STORE}>
        <img src={require("../../assets/appstore.svg")} />
      </a>
    );

  return (
    <S.Flexbox>
      <a href={APP_STORE}>
        <img src={require("../../assets/appstore.svg")} />
      </a>

      <a href={GOOGLE_PLAY}>
        <img src={require("../../assets/googleplay.svg")} />
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
