import { useEffect, useState } from "react";
import { proxyProvider } from "@here-wallet/near-selector/here-provider";
import { legacyProvider } from "@here-wallet/near-selector/legacy-provider";
import { HereProviderOptions, HereProviderResult, HereProviderStatus } from "@here-wallet/near-selector";
import { HereArguments, parseArguments } from "./utilts";
import { failureRedirect, successRedirect } from "./redirects";
import constants from "../constants";

const getRequest = () => {
  const search = window.location.search;
  const args = Object.fromEntries(new URLSearchParams(search).entries());

  if (args.new != null) {
    const id = window.location.pathname.split("/").pop();
    return { isNew: true, id, args };
  }

  return { isNew: false, id: args.request_id, args };
};

export const useSignRequest = () => {
  const [request] = useState(() => getRequest());
  const [link, setLink] = useState("");
  const [args, setArgs] = useState<HereArguments | null>(null);
  const [result, setResult] = useState<HereProviderResult | null>(null);

  useEffect(() => {
    const config: HereProviderOptions = {
      id: request.id,
      args: request.args,
      network: constants.network as any,

      onFailed: (r) => {
        setResult(r);
        failureRedirect(request.args, r);
      },

      onSuccess: (r) => {
        setResult(r);
        successRedirect(request.args, r);
      },

      onApproving: (r) => setResult(r),
      onRequested: (link, args) => {
        const url = new URL(link);
        url.host = window.location.host;
        url.protocol = window.location.protocol;
        window.history.replaceState({}, document.title, url);
        setArgs(parseArguments(args));
        setLink(link);
      },
    };

    const useProxy = request.isNew && constants.network === "mainnet";
    const reject = () => setResult({ account_id: "", status: HereProviderStatus.FAILED });
    const task = useProxy ? proxyProvider(config) : legacyProvider(config);
    task.catch(reject);
  }, [request]);

  return {
    isNew: request.isNew,
    link,
    result,
    args,
  };
};
