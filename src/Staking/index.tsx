import React from "react";
import { observer } from "mobx-react-lite";
import { Route } from "react-router-dom";
import SlideRoutes from "react-slide-routes";

import OtterSecLogo from "../assets/otter-logo.svg?url";
import { Root } from "../Home/styled";
import Header from "../Home/Header";
import { useWallet } from "../core/Accounts";

import FirstStaking from "./FirstStaking";
import FirstSuccess from "./FirstStaking/Success";

import ChangeStaking from "./ChangeStaking";
import ChangeSuccess from "./ChangeStaking/Success";
import { DashboardStaking } from "./DashboardStaking";
import { Card, Container, OtterSecText } from "./styled";

export const Staking = () => {
  return (
    <Root>
      <Header />
      <Container>
        <Card>
          <SlideRoutes timing="ease" duration={300}>
            <Route index element={<PageStaking children={<BootPage />} />} />
            <Route path="change" element={<PageStaking children={<ChangeStaking />} />} />
            <Route path="change/success" element={<PageStaking children={<ChangeSuccess />} />} />
            <Route path="success" element={<PageStaking children={<FirstSuccess />} />} />
          </SlideRoutes>
        </Card>
        <OtterSecText as="a" href="https://osec.io/" target="_blank">
          Secure. Audited by <img src={OtterSecLogo} />
        </OtterSecText>
      </Container>
    </Root>
  );
};

const BootPage = observer(() => {
  const user = useWallet()!;

  if (!user.tokens.hnear.amountFloat && !user.near.hnear.totalDividends) {
    return <PageStaking children={<FirstStaking />} />;
  }

  return <PageStaking children={<DashboardStaking />} />;
});

const PageStaking = observer<{ children: React.ReactElement }>(({ children }) => {
  return children;
});
