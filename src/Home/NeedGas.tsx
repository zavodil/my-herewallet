import React from "react";
import Sheet from "react-modal-sheet";
import { ActionButton, Button, H2, Text } from "../uikit";
import { BoldP, SmallText } from "../uikit/typographic";
import { colors } from "../uikit/theme";
import { sheets } from "../uikit/Popup";
import Icon from "../uikit/Icon";

import { Card, WarningBadge } from "./styled";
import MyAddress from "./MyAddress";

export const NeedMoreGas = ({ onSelectHot }: { onSelectHot?: () => void }) => {
  const openQr = () => {
    sheets.present({ id: "MyQR", element: <MyAddress /> });
  };

  return (
    <Sheet.Scroller>
      <div style={{ padding: "18px 24px", textAlign: "center" }}>
        <img style={{ width: 80, height: 80 }} src={require("../assets/hot/gas.png")} />
        <H2 style={{ marginTop: 16 }}>More Gas needed</H2>

        <Text style={{ marginTop: 16 }}>You've spent all your gas-free transactions. To make transaction from now on you can do the following:</Text>

        <Card style={{ marginTop: 24, background: colors.elevation1, textAlign: "left" }}>
          <Text>Deposit NEAR to your account to cover gas price. Gas fee per claim ~0.002 NEAR</Text>
          <ActionButton $id="NeedGasPopup.depositNear" style={{ width: "100%", marginTop: 20 }} stroke onClick={() => openQr()}>
            Deposit NEAR
          </ActionButton>
        </Card>

        {onSelectHot && (
          <>
            <Text style={{ color: colors.blackSecondary, marginTop: 12, marginBottom: 12 }}>or</Text>
            <Card style={{ position: "relative", background: colors.elevation1, textAlign: "left" }}>
              <WarningBadge style={{ position: "absolute", right: 12, top: -16 }}>
                <Icon viewBox="0 0 24 24" width={16} height={16} name="warning" />
                <BoldP style={{ color: "rgba(219, 133, 32, 1)", fontSize: 14 }}>-30% HOT</BoldP>
              </WarningBadge>

              <Text>We can cover your transaction costs on the blockchain and charge fee in HOT</Text>
              <ActionButton $id="NeedGasPopup.continueWithHot" style={{ width: "100%", marginTop: 20 }} stroke onClick={() => onSelectHot()}>
                Continue with HOT
              </ActionButton>
            </Card>
          </>
        )}

        <Button $id="NeedGasPopup.moreAboutGasFree" style={{ margin: "auto", marginTop: 24 }}>
          <SmallText style={{ color: "#0258F7", fontWeight: "bold" }}>More about Gas Free</SmallText>
        </Button>
      </div>
    </Sheet.Scroller>
  );
};
