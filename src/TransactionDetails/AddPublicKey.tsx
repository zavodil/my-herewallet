import { FC, useState } from "react";

import { ReactComponent as WarningIcon } from "../assets/icons/warning.svg";
import { Button, DomainBadge, H1, H2, Text } from "../uikit";
import PermissionsView from "./PermissionsView";
import * as S from "./styled";

interface Props {
  contract: string;
  methods: string[];
  sidebar: React.ReactNode;
}

const AddPublicKey: FC<Props> = ({ contract, methods, sidebar }) => {
  const [isOpen, setOpen] = useState(false);

  if (isOpen) {
    return <PermissionsView onBack={() => setOpen(false)} />;
  }

  return (
    <>
      <S.Details>
        <div>
          <DomainBadge />
          <H1>Add access key</H1>
          <H2>{contract}</H2>

          <S.PermissionsBadge>
            <WarningIcon />
            <span>Limited permissions.</span>
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

export default AddPublicKey;
