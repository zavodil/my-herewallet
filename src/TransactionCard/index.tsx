import { QRCodeSVG } from "qrcode.react";
import { H2, Loading, Text } from "../uikit";
import { ViewTransaction } from "./ViewTransaction";
import { useSignRequest } from "./useSignRequest";
import * as S from "./styled";

const TransactionCard = () => {
  const { isLoading, deeplink } = useSignRequest();

  return (
    <S.Card isLoading={isLoading}>
      {isLoading && <Loading />}
      <ViewTransaction>
        <S.ScanCode>
          <QRCodeSVG value={deeplink} bgColor="transparent" size={200} />
          <H2>Approve with QR</H2>
          <Text>Scan this code with your phone's camera to sign</Text>
        </S.ScanCode>
      </ViewTransaction>
    </S.Card>
  );
};

export default TransactionCard;
