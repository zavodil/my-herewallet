import Popup from "reactjs-popup";
import React, { useRef } from "react";
import { PopupProps, PopupActions } from "reactjs-popup/dist/types";
import styled, { keyframes } from "styled-components";

const anvil = keyframes`
  0% {
    transform: scale(1);
    opacity: 0;
    box-shadow: 0 0 0 rgba(241, 241, 241, 0);
  }
  1% {
    transform: scale(0.6);
    opacity: 0;
    box-shadow: 0 0 0 rgba(241, 241, 241, 0);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 500px rgba(241, 241, 241, 0);
  }
`;

export const STooltip = styled(Popup)`
  &-overlay {
  }

  &-content {
    max-width: 340px;
    background: #ebdedc;
    border: 1px solid #2c3034;
    border-radius: 16px;
    padding: 12px;
    animation: ${anvil} 0.15s cubic-bezier(0.38, 0.1, 0.36, 0.9) forwards;

    @media (max-width: 576px) {
      max-width: 260px;
    }
  }

  &-content svg {
    color: #ebdedc;
    stroke: #2c3034;
    stroke-width: 2;
    stroke-dasharray: 30px;
    stroke-dashoffset: -54px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

export const Tooltip = (props: PopupProps) => {
  const ref = useRef<PopupActions>(null);
  return (
    <STooltip
      {...props}
      ref={ref}
      children={
        React.isValidElement(props.children)
          ? React.cloneElement(props.children, {
              ...props.children.props,
              onClose: () => ref.current?.close(),
            })
          : props.children
      }
    />
  );
};
