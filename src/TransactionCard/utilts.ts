import { Transaction } from "near-api-js/lib/transaction";
import { Buffer } from "buffer";

export const isIOS = () => {
  return (
    ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

export interface HereArguments {
  transactions: Transaction[];
  contractId: string;
  publicKey: string;
  methodNames: string[];
}

export const parseArguments = (params: Record<string, string>): HereArguments => {
  const contractId = params["contract_id"];
  const publicKey = params["public_key"];
  const methodNames = params["methodNames"]?.split(",") ?? [];

  const messages: string[] = params["transactions"]?.split(",") ?? [];
  const transactions = messages
    .map((msg) => {
      try {
        return Transaction.decode(Buffer.from(msg, "base64"));
      } catch (e) {
        console.log(e);
        return null;
      }
    })
    .filter((v): v is Transaction => v != null);

  return {
    transactions,
    contractId,
    publicKey,
    methodNames,
  };
};
