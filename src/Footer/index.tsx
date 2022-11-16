import constants from "../constants";
import * as S from "./styled";

const Footer = ({ deeplink }: { deeplink: string | null }) => {
  return (
    <S.Footer>
      <img src="/assets/nearhere.png" alt="nearhere" />

      <S.Appstore>
        <S.Flex>
          {deeplink && (
            <S.Button as="a" href={deeplink.replace("https://", `${constants.schema}://`)}>
              Open in Here
            </S.Button>
          )}

          <a href={process.env.REACT_APP_APPSTORE}>
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
