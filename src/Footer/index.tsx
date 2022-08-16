import * as S from "./styled";

const Footer = () => {
  return (
    <S.Footer>
      <img src="/assets/nearhere.png" alt="nearhere" />

      <S.Appstore>
        <a href="appstore.com">
          <img src="/assets/appstore.svg" alt="appstore" />
        </a>

        <p>
          Don’t have an account yet? Visit&nbsp;
          <a href="https://herewallet.app">herewallet.app</a>
        </p>
      </S.Appstore>

      <img src="/assets/rock.png" alt="rock" />
    </S.Footer>
  );
};

export default Footer;
