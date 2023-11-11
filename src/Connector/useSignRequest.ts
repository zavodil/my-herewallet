import { useEffect, useState } from "react";
import { base_decode } from "near-api-js/lib/utils/serialize";
import { HereProviderRequest, HereProviderResult, HereProviderStatus } from "@here-wallet/core";
import { proxyProvider } from "@here-wallet/core";

// try run ci
export const useSignRequest = (data?: string) => {
  const [topic, setTopic] = useState(() => window.localStorage.getItem("topic") || undefined);
  const [request, setRequest] = useState<HereProviderRequest | null>(null);
  const [result, setResult] = useState<HereProviderResult | null>(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    window.localStorage.setItem("topic", topic ?? "");
  }, [topic]);

  const makeRequest = async () => {
    const query = await parseRequest(data);
    if (query == null) throw Error();
    if (query.request == null && query.id == null) throw Error();

    await proxyProvider({
      id: query.id,
      // @ts-ignore
      request: query.request,
      disableCleanupRequest: request == null,

      onFailed: (r) => {
        setResult(r);
        setTopic(r.topic);
        query.returnUrl && callRedirect(query.returnUrl, r);
      },

      onSuccess: (r) => {
        setResult(r);
        setTopic(r.topic);
        if (query.returnUrl) callRedirect(query.returnUrl, r);
        if (query.request?.type === "import") window.close();
      },

      onApproving: (r) => setResult(r),
      onRequested: (id, request: any) => {
        if (request.type == null) request.type = "call";
        setRequest(request);

        const url = new URL(`${window.location.origin}/request/${id}`);
        window.history.replaceState(null, "", url);
        setLink(`herewallet://request/${id}`);

        if (topic) {
          fetch("https://api.herewallet.app/api/v1/transactions/topic/sign", {
            body: JSON.stringify({ request_id: id, topic }),
            method: "POST",
          });
        }
      },
    });
  };

  useEffect(() => {
    makeRequest().catch(() => {
      setResult({ account_id: "", status: HereProviderStatus.FAILED });
    });
  }, []);

  return {
    link,
    result,
    request,
    topic,
  };
};

export const parseRequest = async (
  data?: string
): Promise<{
  id?: string;
  returnUrl?: URL;
  request?: HereProviderRequest;
} | null> => {
  if (data == null) {
    return null;
  }

  let returnUrl: URL | undefined;
  try {
    const url = new URL(new URLSearchParams(window.location.search).get("returnUrl")!);
    if (url.protocol !== "javascript:") returnUrl = url;
  } catch {}

  try {
    const request = JSON.parse(base_decode(data).toString("utf8"));
    return { request, returnUrl };
  } catch {
    return { id: data, returnUrl };
  }
};

export const callRedirect = (returnUrl: URL, result: HereProviderResult) => {
  if (result.account_id) {
    returnUrl.searchParams.set("account_id", result.account_id);
  }

  if (result.status === HereProviderStatus.SUCCESS) {
    returnUrl.searchParams.set("success", encodeURI(result.payload ?? ""));
  }

  if (result.status === HereProviderStatus.FAILED) {
    returnUrl.searchParams.set("failed", encodeURI(result.payload ?? ""));
  }

  window.location.assign(returnUrl);
};
