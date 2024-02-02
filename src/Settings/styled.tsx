import React, { useState } from "react";
import styled from "styled-components";
import { Card } from "../Home/styled";

export const Container = styled.div`
  padding: 40px 120px;
  display: grid;
  width: 100%;
  grid-gap: 20px;

  grid-template-columns: 380px 1fr;
  grid-template-areas:
    "navigation navigation"
    "menu content";

  @media (max-width: 920px) {
    display: flex;
    flex-direction: column;
    padding: 16px;
  }
`;

export const Menu = styled(Card)`
  grid-area: menu;
  height: fit-content;
  overflow: hidden;
  padding: 0;

  button {
    padding: 16px;
    height: 64px;
    gap: 12px;
    transition: 0.2s background-color;
  }

  button:hover {
    opacity: 1;
    background-color: #d9cdcb33;
  }

  img {
    width: 32px;
    height: 32px;
    background-color: #d9cdcb;
    padding: 4px;
    border-radius: 8px;
  }

  button + button {
    border-top: 1px solid var(--Stroke);
  }
`;

export const SSensitiveCard = styled(Card)`
  margin-top: 12px;
  padding: 14px 16px;
  background: var(--Elevation-1);
  overflow: hidden;
  cursor: pointer;
  width: 280px;

  * {
    text-align: left;
    font-family: monospace;
    transition: 0.2s filter;
    font-weight: bold;
  }
`;

export const SensitiveCard = ({ children, style }: any) => {
  const [openSeed, setOpen] = useState(false);

  return (
    <SSensitiveCard style={style} onClick={() => setOpen(true)}>
      <div style={{ textAlign: "left", filter: !openSeed ? "blur(8px)" : "" }}>{children}</div>
    </SSensitiveCard>
  );
};
