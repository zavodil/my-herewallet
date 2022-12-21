import * as S from "./styled";

const Footer = ({ deeplink, network }: { deeplink: string | null; network: string }) => {
  const appStore =
    network === "mainnet" ? "https://appstore.herewallet.app/web" : "https://testflight.apple.com/join/LwvGXAK8";

  return (
    <S.Footer>
      <img src="/assets/nearhere.png" alt="nearhere" />

      <S.Appstore>
        <S.Flex>
          {deeplink && (
            <S.Button as="a" href={deeplink}>
              Open in Here
            </S.Button>
          )}

          <a href={appStore}>
            <img src="/assets/appstore.svg" alt="appstore" />
          </a>
        </S.Flex>

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
