import { action, makeObservable, observable } from "mobx";
import styled, { keyframes } from "styled-components";
import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";

interface PopupConfig {
  id: string;
  element: React.ReactNode;
  onClose?: () => void;
  blocked?: boolean;
  fullscreen?: boolean;
}

class SheetsManager {
  public popups: (PopupConfig & { isOpen: boolean })[] = [];

  constructor() {
    makeObservable(this, {
      popups: observable,
      blocked: action,
      present: action,
    });
  }

  blocked = (id: string, isBlock: boolean) => {
    const p = this.popups.find((t) => t.id === id);
    if (!p) return;
    p.blocked = isBlock;
  };

  present = ({ id, element, blocked, fullscreen, onClose }: PopupConfig) => {
    const popup = this.popups.find((t) => t.id === id);
    if (popup) return;

    this.popups.push({
      id,
      element,
      blocked,
      fullscreen,
      isOpen: false,
      onClose: action(() => {
        const popup = this.popups.find((t) => t.id === id);
        if (!popup) return;
        popup.isOpen = false;
        setTimeout(
          action(() => {
            this.popups = this.popups.filter((t) => t.id !== id);
            onClose?.();
          }),
          300
        );
      }),
    });

    setTimeout(
      action(() => {
        const p = this.popups.find((p) => p.id === id);
        if (p) p.isOpen = true;
      }),
      250
    );
  };

  dismiss = (id: string) => {
    this.popups.find((t) => t.id === id)?.onClose?.();
  };
}

const Popup = ({
  children,
  onClose,
  isOpen,
  fullscreen,
  blocked,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  blocked?: boolean;
  onClose?: () => void;
  fullscreen?: boolean;
}) => {
  const first = useRef(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bodyRef.current || !overlayRef.current) return;
    if (first.current) {
      first.current = false;
      return;
    }

    bodyRef.current.classList.toggle("hide", !isOpen);
    overlayRef.current.classList.toggle("hide", !isOpen);
    bodyRef.current.classList.toggle("show", isOpen);
    overlayRef.current.classList.toggle("show", isOpen);
  }, [isOpen]);

  return (
    <PopupWrap>
      <PopupOverlay ref={overlayRef} onClick={() => !blocked && onClose?.()} />
      <PopupBody
        ref={bodyRef}
        style={{
          borderRadius: fullscreen ? "0" : "20px 20px 0px 0px",
          height: fullscreen ? "100%" : "fit-content",
        }}
      >
        {children}
      </PopupBody>
    </PopupWrap>
  );
};

export const sheets = new SheetsManager();

const PopupsProvider = observer(() => {
  return (
    <div>
      {sheets.popups.map(({ id, element, isOpen, fullscreen, onClose, blocked }) => (
        <Popup key={id} onClose={onClose} fullscreen={fullscreen} isOpen={isOpen} blocked={blocked}>
          {element}
        </Popup>
      ))}
    </div>
  );
});

const slideUp = keyframes`
    0% { transform: translateY(100%);}
    100% { transform: translateY(0%); }
`;

const slideDown = keyframes`
    0% { transform: translateY(0%);}
    100% { transform: translateY(100%); }
`;

const show = keyframes`
    0% { background-color: #00000000 }
    100% { background-color: #00000066 }
`;

const hide = keyframes`
    100% { background-color: #00000000 }
    0% { background-color: #00000066 }
`;

const PopupWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
`;

const PopupBody = styled.div`
  width: 100%;
  border-radius: 20px 20px 0px 0px;
  background: var(--Elevation-0, #f3ebea);
  position: relative;
  will-change: transform;
  overflow: hidden;
  position: absolute;
  bottom: 0;

  transform: translateY(100%);

  &.show {
    animation: ${slideUp} 0.2s;
    animation-fill-mode: forwards;
  }

  &.hide {
    animation: ${slideDown} 0.2s;
    animation-fill-mode: backwards;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  &.show {
    animation: ${show} 0.4s;
    animation-fill-mode: forwards;
  }

  &.hide {
    animation: ${hide} 0.4s;
    animation-fill-mode: backwards;
  }
`;

export default PopupsProvider;
