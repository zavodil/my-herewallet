import { FC } from "react";
import { DomainBadge, H3, H4, Text } from "../uikit";
import * as S from "./styled";

interface Props {
  actions: string[];
  receiver: string;
  network: string;
  sidebar: React.ReactNode;
}

const AnyTransaction: FC<Props> = ({ actions, network, receiver, sidebar }) => {
  return (
    <>
      <S.Details>
        <div>
          <DomainBadge network={network} />
          <H3>Approve Transaction</H3>

          <H4 style={{ marginTop: 32 }}>Actions:</H4>
          <S.Flexbox style={{ width: 300, marginTop: 8 }}>
            {actions.map((act, i) => (
              <S.Badge key={i}>{act}</S.Badge>
            ))}
          </S.Flexbox>
        </div>
        <S.MoreInformation>
          <Text>Receiver: {receiver}</Text>
        </S.MoreInformation>
      </S.Details>
      {sidebar}
    </>
  );
};

export default AnyTransaction;
