import { ReactComponent as WarningIcon } from "../../assets/icons/warning.svg";
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg";
import { ReactComponent as DoneIcon } from "../../assets/icons/done.svg";
import { ReactComponent as BackIcon } from "../../assets/icons/back.svg";
import { Button, H3 } from "../../uikit/elements";
import * as S from "./styled";

const PermissionsView = ({ fullAccess = false, onBack = () => {} }) => {
  return (
    <div>
      <S.Header>
        <Button onClick={onBack}>
          <BackIcon />
        </Button>
        <H3>Permissions</H3>
      </S.Header>
      <S.PermissionsList>
        <S.PermissionItem>
          <DoneIcon />
          View the address of your pemitted account
        </S.PermissionItem>
        <S.PermissionItem>
          <DoneIcon />
          View the balance of your permitted account
        </S.PermissionItem>
        <S.PermissionItem>
          <DoneIcon />
          Call methods on the smart contract on behalf of your permitted account
        </S.PermissionItem>
        <S.PermissionItem>
          {fullAccess ? <WarningIcon style={{ fill: "#DB8520" }} /> : <CloseIcon />}
          Allow the app to transfer tokens
        </S.PermissionItem>
      </S.PermissionsList>
    </div>
  );
};

export default PermissionsView;
