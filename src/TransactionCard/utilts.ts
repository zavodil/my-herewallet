import uuid4 from "uuid4";
import constants from "../constants";
import { RequestData } from "./types";

const topicId = window.localStorage.getItem("topic") || uuid4();
window.localStorage.setItem("topic", topicId);

export const isIOS = () => {
  return (
    ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

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
  }).then((r) => r.json());

export const getTransactionStatus = async (request: string): Promise<RequestData> => {
  const res = await fetch(`https://${constants.api}/api/v1/web/web_request?request_id=${request}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });

  return await res.json();
};

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
