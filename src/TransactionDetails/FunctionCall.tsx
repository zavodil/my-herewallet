import BN from "bn.js";
import { FC } from "react";
import { format } from "near-api-js/lib/utils";

import { useUsdNear } from "../TransactionCard/useCurrency";
import { DomainBadge, H1, H3, Text } from "../uikit";
import * as S from "./styled";

interface Props {
  gas: BN;
  amount: BN;
  method: string;
  receiver: string;
  sidebar: React.ReactNode;
}

const ContractCall: FC<Props> = ({ amount, method, receiver, gas, sidebar }) => {
  const feeNear = format.formatNearAmount(gas.toString());
  const formatFee = +feeNear < 0.00001 ? "< 0.00001" : feeNear;

  const usd2near = useUsdNear();
  const near = format.formatNearAmount(amount.toString(), 6);
  const usd = (+near * usd2near).toFixed(2);

  return (
    <>
      <S.Details>
        <div>
          <DomainBadge />
          <H1>Call smart contract</H1>

          <S.Flexbox style={{ marginTop: 8 }}>
            <H3 style={{ color: "#6B6661" }}>{near} NEAR</H3>
            <Text style={{ color: "#6B6661" }}>${usd}</Text>
          </S.Flexbox>

          <S.Flexbox style={{ marginTop: 32 }}>
            <H3>Method:</H3>
            <S.Badge>{method}</S.Badge>
          </S.Flexbox>
        </div>

        <S.MoreInformation>
          <Text>Contract: {receiver}</Text>
          <Text>Estimated fee: {formatFee} NEAR</Text>
        </S.MoreInformation>
      </S.Details>
      {sidebar}
    </>
  );
};

export default ContractCall;
