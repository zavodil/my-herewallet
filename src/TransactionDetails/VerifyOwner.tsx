import React, { FC } from "react";

import { DomainBadge, Text, H1 } from "../uikit";
import * as S from "./styled";

const VerifyOwner: FC<{ sidebar: React.ReactNode; message: string }> = ({ sidebar, message }) => {
  return (
    <>
      <S.Details>
        <div>
          <DomainBadge />
          <H1>Verify Owner</H1>
          <Text>{message}</Text>
        </div>
      </S.Details>
      {sidebar}
    </>
  );
};

export default VerifyOwner;
