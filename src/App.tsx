import { QRCodeSVG } from "qrcode.react";
import React, { FC, useEffect, useState } from "react";
import uuid4 from "uuid4";

import { ReactComponent as GlobalIcon } from "./assets/icons/global.svg";
import { ReactComponent as WarningIcon } from "./assets/icons/warning.svg";

import { Button, H1, H2, Text } from "./uikit";
import PermissionsView from "./PermissionsView";
import InformationView from "./InformationView";
import Footer from "./Footer";
import * as S from "./styled";

enum ConnectType {
  LimittedPermission,
  FullPermission,
  MethodWithNear,
  TokenTransfer,
  SendMoney,
}

const getPublicKeys = (accountId: string) =>
  fetch("https://rpc.mainnet.near.org", {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "view_access_key_list",
        finality: "final",
        account_id: accountId,
      },
    }),
    headers: {
      "content-type": "application/json",
    },
  });

interface RequestData {
  account_id: string;
  hash: string;
  status: number;
}

const useSignRequest = (requested: string) => {
  const [approve, setApprove] = useState<RequestData | null>(null);

  useEffect(() => {
    console.log(requested);
    const endpoint = `wss://api.herewallet.app/api/v1/web/ws/transaction_approved/${requested}`;
    const socket = new WebSocket(endpoint);
    socket.onerror = (e) => console.log(e); // TODO
    socket.onclose = (e) => console.log(e); // TODO
    socket.onmessage = (e) => {
      if (e.data == null) return;
      try {
        const data = JSON.parse(e.data);
        setApprove(data);
      } catch {}
    };

    return () => socket.close();
  }, [requested]);

  return approve;
};

const ConnectorCard: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requested] = useState(() => uuid4());
  const approved = useSignRequest(requested);

  const query = new URLSearchParams(window.location.search);
  query.set("request_id", requested);

  const deeplink = `herewallet://hereapp.com/sign?${query}`;
  const params = Object.fromEntries(query.entries());
  const [isOpen, setOpen] = useState(false);

  console.log(params);

  useEffect(() => {
    if (approved == null) return;

    const failureRedirect = () => {
      const returnUrl = new URL(params.failure_url);
      window.location.href = returnUrl.toString();
    };

    const successRedirect = async () => {
      const result = await getPublicKeys(approved.account_id);
      const data = await result.json();
      const keys = data.result.keys.map((key: any) => key.public_key);

      const returnUrl = new URL(params.success_url);
      returnUrl.searchParams.set("public_key", params.public_key);
      returnUrl.searchParams.set("all_keys", keys.join(","));

      returnUrl.searchParams.set("transactionHashes", approved.hash);
      returnUrl.searchParams.set("account_id", approved.account_id);
      returnUrl.searchParams.set("meta", params.meta);
      window.location.href = returnUrl.toString();
    };

    if (approved.status === 2) {
      failureRedirect();
      return;
    }

    if (approved.status === 3) {
      successRedirect();
      return;
    }
  }, [approved, params]);

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
