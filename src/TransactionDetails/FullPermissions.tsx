import React, { FC, useState } from "react";

import { Button, DomainBadge, H1, Text } from "../uikit";
import { ReactComponent as WarningIcon } from "../assets/icons/warning.svg";
import PermissionsView from "./PermissionsView";
import * as S from "./styled";

const FullPermissions: FC<{ sidebar: React.ReactNode }> = ({ sidebar }) => {
  const [isOpen, setOpen] = useState(false);

  if (isOpen) {
    return <PermissionsView fullAccess onBack={() => setOpen(false)} />;
  }

  return (
    <>
      <S.Details>
        <div>
          <DomainBadge />
          <H1>Add access key</H1>
          <S.PermissionsBadge style={{ background: "#D63E3E" }}>
            <WarningIcon />
            <span>App requests full access.</span>
            <Button onClick={() => setOpen(true)}>See more</Button>
          </S.PermissionsBadge>
        </div>

        <S.MoreInformation>
          <Text>{"Estimated fee: < 0.0001 NEAR"}</Text>
        </S.MoreInformation>
      </S.Details>
      {sidebar}
    </>
  );
};

export default FullPermissions;
