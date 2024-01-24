import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

import { Root } from "../styled";
import { HereButton } from "../../uikit/button";
import { H0, H1, Text } from "../../uikit";
import { useNavigateBack } from "../../useNavigateBack";

const Onboard = () => {
  useNavigateBack();
  const navigate = useNavigate();
  const [currentPage, setPage] = useState(0);

  return (
    <Root style={{ overflowX: "hidden" }}>
      <div
        style={{
          display: "flex",
          width: "calc(100vw * 3)",
          transform: `translateX(calc(${-currentPage} * 100vw))`,
          transition: "0.2s transform",
        }}
      >
        <Screen>
          <img
            style={{ width: "100%", height: "50vh", objectFit: "contain" }}
            src={require("../../assets/hot/hot1.png")}
          />
          <H1>What is HOT?</H1>
          <Text>
            HOT - native token on NEAR Blockchain. It will be used as the main currency in Telegram games and apps on
            NEAR.
          </Text>
        </Screen>
        <Screen>
          <img
            style={{ width: "100%", height: "50vh", objectFit: "contain" }}
            src={require("../../assets/hot/hot2.png")}
          />
          <H1>Mining</H1>
          <Text>
            7% of the total token allocation will be distributed to the community. To start mining HOT you just need to
            create a wallet.
          </Text>
        </Screen>
        <Screen>
          <img
            style={{ width: "100%", height: "50vh", objectFit: "contain" }}
            src={require("../../assets/hot/hot3.png")}
          />
          <H1>Is it free?</H1>
          <Text>
            Yes - first allocation of HOT token will be free and given to early users. The earlier you create account,
            the more you will earn.
          </Text>
        </Screen>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: 24,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          <Dot $active={currentPage === 0} />
          <Dot $active={currentPage === 1} />
          <Dot $active={currentPage === 2} />
        </div>

        {currentPage < 2 ? (
          <HereButton onClick={() => setPage((t) => t + 1)}>Continue</HereButton>
        ) : (
          <HereButton onClick={() => navigate("/hot", { replace: true })}>Start mining!</HereButton>
        )}
      </div>
    </Root>
  );
};

const Dot = styled.div<{ $active?: boolean }>`
  border-radius: 2px;
  border: 1px solid var(--Black-Primary, #2c3034);
  transition: 0.2s all;
  width: 5px;
  height: 5px;

  ${(p) =>
    p.$active &&
    css`
      width: 32px;
      background: var(--Black-Primary, #2c3034);
    `}
`;

const Screen = styled.div`
  width: 100vw;
  padding: 24px;
`;

export default observer(Onboard);
