import React from "react";
import styled from "styled-components";

export const LoadingPage = () => {
  return (
    <Page style={{ padding: "16px", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <img style={{ width: 150, height: 150 }} src={require("../assets/here.svg")} />
    </Page>
  );
};

const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  min-height: calc(var(--vh, 1vh) * 100);
  width: 100%;
`;
