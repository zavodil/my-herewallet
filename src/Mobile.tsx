import isMobile from "is-mobile";
import React from "react";
import { ActionButton, H3, Text } from "./uikit";
import { Root } from "./Home/styled";
import { colors } from "./uikit/theme";

export const isTgMobile = () => {
  //if (process.env.NODE_ENV === "development") return true;
  return location.origin === "https://tgapp.herewallet.app";
};

const Mobile = ({ Comp }: { Comp: any }) => {
  if (isMobile()) {
    return (
      <Root style={{ justifyContent: "center", textAlign: "center", gap: 8, alignItems: "center", padding: 24 }}>
        <img style={{ marginTop: "auto", width: 140, height: 264 }} src={require("./assets/download-here.png")} />
        <H3>
          Web app is not
          <br />
          supported on Mobile
        </H3>
        <Text style={{ color: colors.blackSecondary }}>
          Download the app to use
          <br />
          HERE on your phone
        </Text>

        <ActionButton as="a" href="https://download.herewallet.app" style={{ marginTop: "auto" }}>
          Download app
        </ActionButton>
      </Root>
    );
  }

  return <Comp />;
};

export default Mobile;
