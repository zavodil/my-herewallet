import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";

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
    this.popups.push({
      id,
      element,
      blocked,
      fullscreen,
      isOpen: true,
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (!bodyRef.current || !overlayRef.current) return;
        bodyRef.current.style.transform = `translateY(0)`;
        overlayRef.current.style.backgroundColor = "#00000066";
      }, 150);
      return () => clearTimeout(timer);
    }

    if (!bodyRef.current || !overlayRef.current) return;
    bodyRef.current.style.transform = `translateY(100%)`;
    overlayRef.current.style.backgroundColor = "#00000000";
  }, [isOpen]);

  return (
    <PopupWrap>
      <PopupOverlay ref={overlayRef} onClick={() => !blocked && onClose?.()} />
      <PopupBody style={{ height: fullscreen ? "100%" : "fit-content" }} ref={bodyRef}>
        {children}
      </PopupBody>
    </PopupWrap>
  );
};

export const sheets = new SheetsManager();

const PopupsProvider = observer(() => {
  const app = useWebApp();
  useEffect(() => {
    app?.expend?.();
  }, []);

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

const PopupWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  z-index: 100000;
`;

const PopupBody = styled.div`
  border-radius: 24px 24px 0px 0px;
  width: 100%;
  border-radius: 20px 20px 0px 0px;
  background: var(--Elevation-0, #f3ebea);
  position: relative;
  transform: translateY(100%);
  transition: 0.3s transform;
  will-change: transform;
  overflow: hidden;
`;

const PopupOverlay = styled.div`
  transition: 0.6s backdrop-filter, 0.2s background-color;
  backdrop-filter: blur(0px);
  background-color: #00000000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export default PopupsProvider;
