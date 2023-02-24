import React from "react";
import { observer } from "mobx-react-lite";
import { Route } from "react-router-dom";
import SlideRoutes from "react-slide-routes";

import OtterSecLogo from "jsx:../assets/otter-logo.svg";
import { AppContextProvider, useWallet } from "../core/useWallet";
import { ActivityIndicator } from "../uikit";

import { Card, CardView, Container, OtterSecText, Page } from "./styled";
import { DashboardStaking } from "./DashboardStaking";
import { StartStaking } from "./EnterStaking";
import Header from "./Header";

import FirstStaking from "./FirstStaking";
import FirstSuccess from "./FirstStaking/Success";

import ChangeStaking from "./ChangeStaking";
import ChangeSuccess from "./ChangeStaking/Success";

export const Staking = () => {
  return (
    <AppContextProvider>
      <Page>
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
          <OtterSecText as="a" href="https://osec.io/" target="_blank" rel="noopener noreferrer">
            Secure. Audited by <OtterSecLogo />
          </OtterSecText>
        </Container>
      </Page>
    </AppContextProvider>
  );
};

const BootPage = () => {
  const { user } = useWallet();

  if (user == null) {
    return <PageStaking children={<StartStaking />} />;
  }

  if (!user.state.staked && !user.state.totalIncome) {
    return <PageStaking children={<FirstStaking />} />;
  }

  return <PageStaking children={<DashboardStaking />} />;
};

const PageStaking = observer<{ children: React.ReactElement }>(({ children }) => {
  const { user, selector } = useWallet();

  if (selector == null || user?.isInitialized === false) {
    return (
      <CardView>
        <ActivityIndicator />
      </CardView>
    );
  }

  return children;
});
