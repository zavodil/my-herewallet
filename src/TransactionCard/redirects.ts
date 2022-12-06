import { HereProviderResult } from "@here-wallet/near-selector";
import { getPublicKeys } from "@here-wallet/near-selector/utils";
import constants from "../constants";

export const failureRedirect = (params: Record<string, string>, result: HereProviderResult) => {
  if (params.failure_url == null && params.callbackUrl == null) return;
  const returnUrl = new URL(params.failure_url || params.callbackUrl);

  if (result.account_id) {
    returnUrl.searchParams.set("account_id", result.account_id);
  }

  if (params.meta) {
    returnUrl.searchParams.set("meta", params.meta);
  }

  if (result.payload) {
    returnUrl.searchParams.set("errorMessage", encodeURI(result.payload));
  }

  window.location.assign(returnUrl);
};

export const successRedirect = async (params: Record<string, string>, result: HereProviderResult) => {
  if (params.success_url == null && params.callbackUrl == null) return;
  const returnUrl = new URL(params.success_url || params.callbackUrl);

  if (params.meta) {
    returnUrl.searchParams.set("meta", params.meta);
  }

  if (params.public_key) {
    returnUrl.searchParams.set("public_key", params.public_key);
  }

  if (result.account_id) {
    returnUrl.searchParams.set("account_id", result.account_id);

    const data = await getPublicKeys(constants.rpc, result.account_id).catch(() => []);
    const keys = data.filter((key: any) => key.access_key?.permission === "FullAccess");
    const publicKey = keys.pop();

    if (publicKey?.public_key) {
      returnUrl.searchParams.set("all_keys", publicKey.public_key);
    }
  }

  if (result.payload) {
    returnUrl.searchParams.set("transactionHashes", result.payload);
  }

  window.location.assign(returnUrl);
};
