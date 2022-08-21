import { ReactComponent as BackIcon } from "../../assets/icons/back.svg";
import { Button, H3 } from "../../uikit";
import * as S from "./styled";

const InformationView = ({ onBack = () => {} }) => {
  return (
    <div style={{ width: "100%" }}>
      <S.Header>
        <Button onClick={onBack}>
          <BackIcon />
        </Button>
        <H3>Information</H3>
      </S.Header>
    </div>
  );
};

export default InformationView;
