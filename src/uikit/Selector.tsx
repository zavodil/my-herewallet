import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Text } from "./typographic";
import Icon from "./Icon";

interface Props {
  options: any[];
  value: any;
  label: string;
  renderOption: (data: any) => React.ReactNode;
}

const HereSelector = (props: Props) => {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    document.body.addEventListener("click", () => {
      setOpen(false);
    });
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <Container
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {props.value ? (
          props.renderOption(props.value)
        ) : (
          <Text style={{ color: "var(--Black-Secondary)", marginLeft: 8 }}>{props.label}</Text>
        )}
        <Icon name="cursor-down" />
      </Container>

      {isOpen && <Menu>{props.options.map((item) => props.renderOption(item))}</Menu>}
    </div>
  );
};

const Container = styled.button`
  display: flex;
  height: 56px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  gap: 12px;
  padding: 0 16px 0 8px;
  outline: none;
  width: 100%;

  border-radius: 16px;
  border: 1px solid var(--Black-Primary, #2c3034);
  background: var(--Elevation-1, #ebdedc);
  transition: 0.2s all;

  &:focus {
    box-shadow: 4px 4px 0 0 var(--Black-Primary, #2c3034);
  }
`;

const Menu = styled.div`
  position: absolute;
  z-index: 100000;
  border-radius: 12px;
  border: 1px solid var(--Black-Primary, #2c3034);
  background: var(--Elevation-1, #ebdedc);
  box-shadow: 0px 16px 40px 0px rgba(44, 48, 52, 0.2);
  display: flex;
  width: 100%;
  max-height: 300px;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  overflow-y: auto;
  margin-top: 8px;
`;

export default HereSelector;
