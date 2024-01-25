import { useNavigate, useParams } from "react-router-dom";
import React, { useState } from "react";
import { groupBy } from "lodash";

import { BoldP, H3, LargeP, SmallText } from "../uikit/typographic";
import { Card, Container, Root } from "../Home/styled";
import { Button } from "../uikit";
import Header from "../Home/Header";
import Icon from "../uikit/Icon";

import { AppsGrid, SearchInput, Tab } from "./styled";
import apps from "./apps.json";

const Apps = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const groups = Object.values(groupBy(apps, (a) => a.type));
  const searched = groups
    .filter((group) => !id || group[0].type.replaceAll(" ", "_").toLowerCase() === id)
    .map((group) =>
      group.filter((item) => {
        if (item.type.includes(search)) return true;
        if (item.contract && item.contract.includes(search)) return true;
        if (item.name && item.name.includes(search)) return true;
        if (item.text && item.text.includes(search)) return true;
        return false;
      })
    )
    .filter((g) => g.length > 0);

  return (
    <Root>
      <Header />
      <Container style={{ flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 32 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tab $active={!id} onClick={() => navigate("/apps")}>
              <BoldP>All</BoldP>
            </Tab>

            {groups
              .map((t) => t[0].type)
              .sort()
              .map((type) => (
                <Tab
                  key={type}
                  $active={type.replaceAll(" ", "_").toLowerCase() === id}
                  onClick={() => navigate("/apps/" + type.replaceAll(" ", "_").toLowerCase())}
                >
                  <BoldP>{type}</BoldP>
                </Tab>
              ))}
          </div>

          <SearchInput>
            <Icon style={{ flexShrink: 0 }} name="search" />
            <input value={search} placeholder="Search app" onChange={(e) => setSearch(e.target.value.toLowerCase())} />
          </SearchInput>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 40 }}>
          {!searched.length && <H3>No projects found</H3>}
          {searched.map((group) => {
            return (
              <div key={group[0].type}>
                <H3>{group[0].type}</H3>
                <AppsGrid>
                  {group.map((app) => (
                    <Card
                      style={{ minHeight: 300, position: "relative", marginTop: 48, textDecoration: "none" }}
                      rel="noopener noreferrer"
                      href={app.site}
                      target="_blank"
                      as="a"
                    >
                      <div style={{ marginTop: -60, marginBottom: 24, position: "relative" }}>
                        <img
                          style={{ position: "absolute", top: 20, filter: "blur(20px)", opacity: 0.6 }}
                          src={app.image}
                        />
                        <img style={{ zIndex: 10, position: "relative" }} src={app.image} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                          position: "absolute",
                          width: "32%",
                          top: 16,
                          right: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        {[
                          { url: app.twitter, img: require("../assets/twitter.svg") },
                          { url: app.discord, img: require("../assets/discord.svg") },
                          { url: app.telegram, img: require("../assets/telegram.svg"), size: 28 },
                        ].map(
                          (social) =>
                            social.url != null && (
                              <Button rel="noopener noreferrer" href={social.url} target="_blank" as="a">
                                <img style={{ width: social.size || 24, height: social.size || 24 }} src={social.img} />
                              </Button>
                            )
                        )}
                      </div>

                      <LargeP style={{ fontWeight: 800 }}>{app.name}</LargeP>
                      <SmallText style={{ marginTop: 12, fontWeight: 600 }}>{app.text}</SmallText>
                    </Card>
                  ))}
                </AppsGrid>
              </div>
            );
          })}
        </div>
      </Container>
    </Root>
  );
};

export default Apps;
