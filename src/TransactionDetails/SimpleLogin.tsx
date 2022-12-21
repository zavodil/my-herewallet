import { FC, useState } from "react";

import { ReactComponent as WarningIcon } from "../assets/icons/warning.svg";
import { Button, DomainBadge, H1 } from "../uikit";
import PermissionsView from "./PermissionsView";
import * as S from "./styled";

interface Props {
  sidebar: React.ReactNode;
  network: string;
}

const SimpleLogin: FC<Props> = ({ sidebar, network }) => {
  const [isOpen, setOpen] = useState(false);

  if (isOpen) {
    return <PermissionsView onBack={() => setOpen(false)} />;
  }

  return (
    <>
      <S.Details>
        <div>
          <DomainBadge network={network} />
          <H1>
            Login to
            <br />
            dApp with wallet
          </H1>

          <S.PermissionsBadge>
            <WarningIcon />
            <span>Limited permissions.</span>
            <Button onClick={() => setOpen(true)}>See more</Button>
          </S.PermissionsBadge>
        </div>
      </S.Details>
      {sidebar}
    </>
  );
};

export default SimpleLogin;
