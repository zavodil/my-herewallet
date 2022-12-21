import BN from "bn.js";
import { FC } from "react";
import { format } from "near-api-js/lib/utils";

import { useUsdNear } from "../TransactionCard/useCurrency";
import { DomainBadge, H0, H3, H2, H4, Text } from "../uikit";
import * as S from "./styled";

interface Props {
  amount: BN;
  network: string;
  receiver: string;
  sidebar: React.ReactNode;
}

const TransferCall: FC<Props> = ({ amount, receiver, network, sidebar }) => {
  const usd2near = useUsdNear();
  const near = format.formatNearAmount(amount.toString(), 6);
  const usd = (+near * usd2near).toFixed(2);

  return (
    <>
      <S.Details>
        <div>
          <DomainBadge network={network} />
          <H4>Approve Transaction</H4>
          <H0 style={{ marginTop: 12 }}>
            {near} <H2 as="span">NEAR</H2>
          </H0>
          <H3 style={{ color: "#6B6661", marginLeft: 2, marginTop: -4 }}>${usd}</H3>
        </div>

        <S.MoreInformation>
          <Text>Receiver: {receiver}</Text>
          <Text>{"Estimated fee: < 0.00001 NEAR"}</Text>
        </S.MoreInformation>
      </S.Details>
      {sidebar}
    </>
  );
};

export default TransferCall;
