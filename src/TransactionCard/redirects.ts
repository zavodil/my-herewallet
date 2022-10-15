import { RequestData } from "./types";
import { getPublicKeys } from "./utilts";

const defaultReturnUrl = "https://herewallet.app";

export const failureRedirect = (approved: RequestData) => {
  const query = new URLSearchParams(new URL(approved.transaction).search);
  const params = Object.fromEntries(query.entries());
  const returnUrl = new URL(params.failure_url || params.callbackUrl || defaultReturnUrl);
  window.location.href = returnUrl.toString();
};

export const successRedirect = async (approved: RequestData) => {
  const query = new URLSearchParams(new URL(approved.transaction).search);
  const params = Object.fromEntries(query.entries());
  const returnUrl = new URL(params.success_url || params.callbackUrl || defaultReturnUrl);

  if (params.meta) {
    returnUrl.searchParams.set("meta", params.meta);
  }

  if (params.message) {
    try {
      const sign = decodeURIComponent(escape(window.atob(approved.transaction_hash)));
      const data = JSON.parse(sign);

      returnUrl.searchParams.set("signature", data.signature);
      returnUrl.searchParams.set("accountId", data.message.accountId);
      returnUrl.searchParams.set("blockId", data.message.blockId);
      returnUrl.searchParams.set("publicKey", data.message.publicKey);
      returnUrl.searchParams.set("message", data.message.message);
      returnUrl.searchParams.set("keyType", data.message.keyType);
      returnUrl.searchParams.delete("transactionHashes");
      window.location.href = returnUrl.toString();
    } catch {
      failureRedirect(approved);
      return;
    }
  }

  if (params.public_key) {
    returnUrl.searchParams.set("public_key", params.public_key);
    returnUrl.searchParams.set("account_id", approved.account_id);

    const data = await getPublicKeys(approved.account_id).catch(() => []);
    const keys = data.result.keys.filter((key: any) => key.access_key?.permission === "FullAccess");
    const publicKey = keys.pop();

    if (publicKey.public_key) {
      returnUrl.searchParams.set("all_keys", publicKey.public_key);
    }
  }

  if (approved.transaction_hash) {
    returnUrl.searchParams.set("transactionHashes", approved.transaction_hash);
  }

  window.location.href = returnUrl.toString();
};
