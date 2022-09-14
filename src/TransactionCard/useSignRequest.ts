import { useCallback, useEffect, useState } from "react";
import uuid4 from "uuid4";
import constants from "../constants";

export interface RequestData {
  account_id: string;
  hash: string;
  status: number;
}

export const getPublicKeys = (accountId: string) =>
  fetch(constants.rpc, {
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

const topicId = window.localStorage.getItem("topic") || uuid4();
window.localStorage.setItem("topic", topicId);

export const createRequest = (request: string) => {
  const query = new URLSearchParams(window.location.search);
  query.append("request_id", request);

  try {
    const host = new URL(document.referrer).hostname ?? "";
    query.append("referrer", host);
  } catch {}

  return fetch(`https://${constants.api}/api/v1/web/request_transaction_sign`, {
    method: "POST",
    body: JSON.stringify({
      transaction: `${constants.walletSchema}://hereapp.com/sign_request?${query}`,
      request_id: request,
      topic: topicId,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
};

const defaultReturnUrl = "https://herewallet.app";

export const useSignRequest = () => {
  const [requested] = useState(() => uuid4());
  const [isLoading, setLoading] = useState(false);

  const processApprove = useCallback(
    (approved: RequestData) => {
      const query = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(query.entries());

      const failureRedirect = () => {
        const returnUrl = new URL(params.failure_url || params.callbackUrl || defaultReturnUrl);
        window.location.href = returnUrl.toString();
      };

      const successRedirect = async () => {
        const returnUrl = new URL(params.success_url || params.callbackUrl || defaultReturnUrl);
        returnUrl.searchParams.set("meta", params.meta);

        if (params.public_key) {
          returnUrl.searchParams.set("public_key", params.public_key);
          returnUrl.searchParams.set("account_id", approved.account_id);

          const result = await getPublicKeys(approved.account_id);
          const data = await result.json();
          const keys = data.result.keys.map((key: any) => key.public_key);

          if (keys.length) {
            returnUrl.searchParams.set("all_keys", keys.join(","));
          }
        }

        if (approved.hash) {
          returnUrl.searchParams.set("transactionHashes", approved.hash);
        }

        window.location.href = returnUrl.toString();
      };

      if (approved.status === 1) {
        setLoading(true);
        return;
      }

      if (approved.status === 2) {
        failureRedirect();
        return;
      }

      if (approved.status === 3) {
        successRedirect();
        return;
      }
    },
    [setLoading]
  );

  useEffect(() => {
    void createRequest(requested);

    const endpoint = `wss://${constants.api}/api/v1/web/ws/transaction_approved/${requested}`;
    const socket = new WebSocket(endpoint);
    socket.onerror = (e) => console.log(e); // TODO
    socket.onclose = (e) => console.log(e); // TODO
    socket.onmessage = (e) => {
      if (e.data == null) return;
      try {
        const data = JSON.parse(e.data);
        processApprove(data);
      } catch {}
    };

    return () => socket.close();
  }, [requested, processApprove]);

  return {
    deeplink: `${constants.walletSchema}://hereapp.com/sign_request?${requested}`,
    isLoading,
  };
};
