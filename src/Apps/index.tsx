import React from "react";
import { Card, Container, Root } from "../Home/styled";
import Header from "../Home/Header";
import { Button, H0, Text } from "../uikit";
import apps from "./apps.json";
import styled from "styled-components";
import { H3, LargeP, SmallText } from "../uikit/typographic";
import { groupBy } from "lodash";

const Apps = () => {
  return (
    <Root>
      <Header />
      <Container style={{ flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginTop: 48, marginBottom: 52 }}>
          <H0>Apps</H0>
          <Text style={{ marginTop: 8 }}>Connect your wallet and explore more in the ecosystem</Text>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {Object.values(groupBy(apps, (a) => a.type)).map((group) => (
            <div>
              <H3>{group[0].type} projects</H3>
              <AppsGrid>
                {group.map((app) => (
                  <Card
                    style={{ minHeight: 300, position: "relative", marginTop: 48, textDecoration: "none" }}
                    as="a"
                    rel="noopener noreferrer"
                    href={app.site}
                    target="_blank"
                  >
                    <div style={{ marginTop: -60, marginBottom: 24, position: "relative" }}>
                      <img
                        style={{ position: "absolute", top: 20, filter: "blur(20px)", opacity: 0.6 }}
                        src={app.image}
                      />
                      <img style={{ zIndex: 10, position: "relative" }} src={app.image} />
                    </div>

                    <Button
                      style={{ position: "absolute", top: 16, right: 16 }}
                      as="a"
                      rel="noopener noreferrer"
                      href={app.twitter}
                      target="_blank"
                    >
                      <img style={{ width: 24, height: 24 }} src={require("../assets/twitter.svg")} />
                    </Button>

                    <LargeP style={{ fontWeight: 800 }}>{app.name}</LargeP>
                    <SmallText style={{ marginTop: 12, fontWeight: 600 }}>{app.text}</SmallText>
                  </Card>
                ))}
              </AppsGrid>
            </div>
          ))}
        </div>
      </Container>
    </Root>
  );
};

const AppsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 24px;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 48px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 920px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }

  img {
    border-radius: 40px;
    width: 136px;
    height: 136px;
  }

  ${Card} {
    transition: 0.2s border;
    &:hover {
      border: 1px solid var(--Black-Primary);
    }
  }
`;

export default Apps;
