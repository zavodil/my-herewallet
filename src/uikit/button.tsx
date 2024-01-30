import React from "react";
import styled, { css } from "styled-components";
import { AnalyticsTracker } from "../core/analytics";

export const SButton = styled.button<{ $active?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${(p) => (p.$active ? "#E7DFDE" : "")};

  transition: 0.2s opacity;
  &:hover {
    opacity: 0.6;
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
`;

export const SActionButton = styled.button<{ big?: boolean; stroke?: boolean }>`
  color: #fff;
  border: none;
  text-decoration: none;
  align-items: center;
  justify-content: center;
  background: #2c3034;
  flex-shrink: 0;
  width: 100%;
  height: 56px;
  cursor: pointer;

  font-family: "Manrope";
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  width: calc(100% + 8px);
  padding: 0 16px;
  overflow: hidden;

  display: flex;
  font-weight: bolder;
  border-radius: 24px;
  transition: 0.2s opacity, 0.2s background, 0.2s color;

  &:disabled {
    cursor: default;
    opacity: 1;
    background: #cbc6c5;
    color: #6b6661;
  }

  ${(p) =>
    p.big &&
    css`
      border-radius: 32px;
      height: 80px;
    `}

  ${(p) =>
    p.stroke &&
    css`
      background: transparent;
      border: 1px solid var(--Black-Primary);
      color: var(--Black-Primary);
    `}
`;

export const SStrokeButton = styled(SActionButton)`
  background: transparent;
  border: 2px solid #2c3034;
  color: #2c3034;
`;

export const SLinkButton = styled.button`
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;

  font-family: "Manrope";
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  text-decoration-line: underline;
  color: #fd84e3;
`;

export const SHereButton = styled.button`
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  gap: 8px;

  height: 46px;
  background: #fdbf1e;
  cursor: pointer;

  border: 1px solid #2c3034;
  box-shadow: 4px 4px 0px #2c3034;
  border-radius: 16px;

  transition: 0.2s box-shadow, 0.2s transform;

  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;

  font-family: "Manrope";
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: #2c3034;
  text-decoration: none;

  &.pressed {
    box-shadow: 0 0 0 #2c3034;
    transform: translate(4px, 4px);
  }

  &:disabled {
    cursor: default;
    background: #cbc6c5;
    border: 1px solid #6b6661;
    box-shadow: 4px 4px 0px #6b6661;
    pointer-events: none;
  }
`;

type ButtonProps = (React.HTMLProps<HTMLButtonElement> & { $id: string }) | (React.HTMLProps<HTMLAnchorElement> & { as: "a"; $id: string });

export const Button = (p: ButtonProps & { $active?: boolean }) => {
  return (
    <SButton
      {...(p as any)}
      onClick={(e: any) => {
        AnalyticsTracker.shared.track("button:" + p.$id);
        p.onClick?.(e);
      }}
    />
  );
};

export const ActionButton = (p: ButtonProps & { big?: boolean; stroke?: boolean }) => {
  return (
    <SActionButton
      {...(p as any)}
      onClick={(e: any) => {
        AnalyticsTracker.shared.track("button:" + p.$id);
        p.onClick?.(e);
      }}
    />
  );
};

export const StrokeButton = (p: ButtonProps) => {
  return (
    <SStrokeButton
      {...(p as any)}
      onClick={(e: any) => {
        AnalyticsTracker.shared.track("button:" + p.$id);
        p.onClick?.(e);
      }}
    />
  );
};

export const LinkButton = (p: ButtonProps) => {
  return (
    <SLinkButton
      {...(p as any)}
      onClick={(e: any) => {
        AnalyticsTracker.shared.track("button:" + p.$id);
        p.onClick?.(e);
      }}
    />
  );
};

export const HereButton = (p: ButtonProps & { $id: string }) => {
  return (
    <SHereButton
      {...(p as any)}
      onPointerDown={(e) => e.currentTarget.classList.add("pressed")}
      onPointerOver={(e) => e.currentTarget.classList.remove("pressed")}
      onPointerUp={(e) => e.currentTarget.classList.remove("pressed")}
      onPointerCancel={(e) => e.currentTarget.classList.remove("pressed")}
      onPointerLeave={(e) => e.currentTarget.classList.remove("pressed")}
      onClick={(e: any) => {
        AnalyticsTracker.shared.track("button:" + p.$id);
        p.onClick?.(e);
      }}
    />
  );
};
