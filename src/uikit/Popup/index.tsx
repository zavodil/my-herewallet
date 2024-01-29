import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import Sheet from "react-modal-sheet";
import React from "react";
import { colors } from "../theme";

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

    setTimeout(() => {
      const popup = this.popups.find((t) => t.id === id);
      if (popup) runInAction(() => (popup.isOpen = true));
    }, 100);
  };

  dismiss = (id: string) => {
    this.popups.find((t) => t.id === id)?.onClose?.();
  };
}

export const sheets = new SheetsManager();

const PopupsProvider = observer(() => {
  return (
    <>
      {sheets.popups.map(({ element, isOpen, fullscreen, onClose, blocked }) => (
        <Sheet isOpen={isOpen} disableDrag={blocked} onClose={() => onClose?.()} detent={fullscreen ? "full-height" : "content-height"}>
          <Sheet.Container style={{ background: colors.elevation0, borderRadius: "16px 16px 0 0" }}>
            <Sheet.Header style={{ marginTop: -32, height: 32 }} disableDrag={blocked} />
            <Sheet.Content disableDrag={blocked}>
              <Sheet.Scroller>{element}</Sheet.Scroller>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={() => !blocked && onClose?.()} />
        </Sheet>
      ))}
    </>
  );
});

export default PopupsProvider;
