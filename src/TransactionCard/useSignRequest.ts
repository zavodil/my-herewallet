import { useEffect, useState } from "react";
import { proxyProvider } from "@here-wallet/core/here-provider";
import { HereProviderRequest, HereProviderResult, HereProviderStatus } from "@here-wallet/core";
import { base_decode } from "near-api-js/lib/utils/serialize";

export const useSignRequest = () => {
  const [request, setRequest] = useState<HereProviderRequest | null>(null);
  const [result, setResult] = useState<HereProviderResult | null>(null);
  const [link, setLink] = useState("");

  const makeRequest = async () => {
    const query = parseQuery();
    let request = null;

    try {
      const body = base_decode(query.id!).toString("utf8");
      request = JSON.parse(body);
    } catch {}

    await proxyProvider({
      id: request == null ? query.id : undefined,
      disableCleanupRequest: request == null,
      transactions: request != null ? request.transactions : undefined,
      network: request != null ? request.network : undefined,

      onFailed: (r) => {
        setResult(r);
        query.returnUrl && callRedirect(query.returnUrl, r);
      },

      onSuccess: (r) => {
        setResult(r);
        query.returnUrl && callRedirect(query.returnUrl, r);
      },

      onApproving: (r) => setResult(r),
      onRequested: (request) => {
        setRequest(request);
        if (request.network === "testnet") {
          setLink(`testnet.herewallet://h4n.app/${request.id}`);
        } else {
          setLink(`https://h4n.app/${request.id}`);
        }
      },
    });
  };

  useEffect(() => {
    makeRequest().catch(() => setResult({ account_id: "", status: HereProviderStatus.FAILED }));
  }, []);

  return {
    link,
    result,
    request,
  };
};

export const parseQuery = () => {
  const id = window.location.pathname.split("/").pop();
  try {
    const url = new URL(window.location.href).searchParams.get("returnUrl");
    return { returnUrl: new URL(url!), id };
  } catch {
    return { id };
  }
};

export const callRedirect = (returnUrl: URL, result: HereProviderResult) => {
  if (result.account_id) {
    returnUrl.searchParams.set("account_id", result.account_id);
  }

  if (result.payload) {
    returnUrl.searchParams.set("payload", encodeURI(result.payload));
  }

  window.location.assign(returnUrl);
};