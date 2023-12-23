import React, { useEffect } from "react";
import styled from "styled-components";
import { Text } from "./typographic";

type Props =
  | (React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & {
      multiline: true;
      label?: string;
    })
  | (React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
      label?: string;
      multiline?: false;
      postfix?: string;
    });

const HereInput = (props: Props) => {
  return (
    <InputWrap
      className={props.value ? "editted" : ""}
      style={{ paddingTop: props.multiline ? 25 : 12, paddingBottom: props.multiline ? 12 : 0 }}
    >
      {props.label && <Label>{props.label}</Label>}
      {props.multiline ? (
        <textarea {...props} />
      ) : (
        <div style={{ position: "relative", maxWidth: "90%" }}>
          <span>{props.value}</span>
          <input {...props} />
        </div>
      )}
      {!props.multiline && props.postfix && <Postfix>{props.postfix}</Postfix>}
    </InputWrap>
  );
};

const Label = styled.p``;
const Postfix = styled(Text)`
  margin-left: 8px;
`;

const InputWrap = styled.label`
  border: none;
  padding: 12px 16px 0;
  margin: 0;
  cursor: pointer;
  border-radius: 16px;
  border: 1px solid var(--Black-Primary, #2c3034);
  background: var(--surface-container--low, #ebdedc);
  min-height: 56px;
  display: flex;

  transition: 0.2s box-shadow;
  align-items: center;
  position: relative;

  ${Postfix} {
    font-size: 18px;
    line-height: 25px;
    color: var(--Black-Secondary, #6b6661);
    height: 24px;
  }

  ${Label} {
    transition: 0.2s all;
    color: var(--Black-Secondary, #6b6661);
    margin: 0;

    top: 16px;
    position: absolute;
    color: var(--Black-Secondary, #6b6661);
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
  }

  textarea {
    width: 100%;
  }

  input {
    width: 100%;
    position: absolute;
    left: 0;
    top: -1px;
  }

  span {
    opacity: 0;
    pointer-events: none;
    max-width: 90%;
  }

  input,
  textarea,
  span {
    font-size: 18px;
    line-height: 18px;
    outline: none;
    background: none;
    border: none;
    padding: 0;
    font-weight: 600;
    resize: none;
  }

  &:focus-within,
  &.editted {
    box-shadow: 4px 4px 0 0 var(--Black-Primary, #2c3034);
    ${Label} {
      top: 8px;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 14px;
    }
  }
`;

export default HereInput;
