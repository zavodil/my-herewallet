import { QRCodeSVG } from "qrcode.react";
import React, { FC, useState } from "react";

import { ReactComponent as GlobalIcon } from "./assets/icons/global.svg";
import { ReactComponent as WarningIcon } from "./assets/icons/warning.svg";

import { useSignRequest } from "./model";
import { Button, H1, H2, Text } from "./uikit";
import PermissionsView from "./PermissionsView";
import InformationView from "./InformationView";
import Footer from "./Footer";
import * as S from "./styled";

const ConnectorCard: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, deeplink } = useSignRequest();
  const [isOpen, setOpen] = useState(false);

  if (isOpen) {
    return (
      <S.Card>
        <InformationView onBack={() => setOpen(false)} />
      </S.Card>
    );
  }

  return (
    <S.Card>
      <S.SignInformation>
        {children}

        <S.MoreInformation>
          <Text>{"Estimated fee: < 0.00001 NEAR"}</Text>
          <Button onClick={() => setOpen(true)}>More information</Button>
        </S.MoreInformation>
      </S.SignInformation>

      <S.ScanCode>
        <QRCodeSVG value={deeplink} bgColor="transparent" size={200} />
        <H2>Approve with QR</H2>
        <Text>
          Scan the code with <br />
          <b>HERE Wallet mobile app</b> to sign
        </Text>
      </S.ScanCode>
    </S.Card>
  );
};

const getConnectType = () => {
  const params = new URLSearchParams(window.location.search);
  const contractId = params.get("contract_id");
  const publicKey = params.get("public_key");

  if (contractId == null && publicKey != null) {
    return <FullPermissions />;
  }

  return <LimittedPermissions />;
};

const DomainBadge = () => {
  const from = document.referrer ? new URL(document.referrer).hostname : "Unknown";

  return (
    <S.DomainBadge>
      <GlobalIcon />
      <span>{from}</span>
    </S.DomainBadge>
  );
};

const LimittedPermissions = () => {
  const [isOpen, setOpen] = useState(false);

  if (isOpen) {
    return (
      <S.Card>
        <PermissionsView onBack={() => setOpen(false)} />
      </S.Card>
    );
  }

  return (
    <ConnectorCard>
      <div>
        <DomainBadge />
        <H1>Add access key</H1>

        <S.PermissionsBadge>
          <WarningIcon />
          <span>Limited permissions.</span>
          <Button onClick={() => setOpen(true)}>See more</Button>
        </S.PermissionsBadge>
      </div>
    </ConnectorCard>
  );
};

const FullPermissions = () => {
  const [isOpen, setOpen] = useState(false);

  if (isOpen) {
    return (
      <S.Card>
        <PermissionsView fullAccess onBack={() => setOpen(false)} />
      </S.Card>
    );
  }

  return (
    <ConnectorCard>
      <div>
        <DomainBadge />
        <H1>Add access key</H1>

        <S.PermissionsBadge style={{ background: "#D63E3E" }}>
          <WarningIcon />
          <span>App requests full access.</span>
          <Button onClick={() => setOpen(true)}>See more</Button>
        </S.PermissionsBadge>
      </div>
    </ConnectorCard>
  );
};

function App() {
  const connector = getConnectType();

  return (
    <S.Page>
      {connector}
      <Footer />
    </S.Page>
  );
}

export default App;
