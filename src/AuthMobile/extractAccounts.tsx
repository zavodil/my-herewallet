import crypto from "crypto";
import { JsonRpcProvider } from "near-api-js/lib/providers";

import { decryptText } from "../core/Storage";
import { UserCred } from "../core/types";

const rpc = new JsonRpcProvider({ url: "https://rpc.mainnet.near.org" });
const extractAccounts = async () => {
  const list: UserCred[] = [];
  Object.entries({ ...localStorage }).forEach(([key, value]) => {
    try {
      const salt = crypto.createHash("sha256").update(key).digest().toString("hex");
      list.push(JSON.parse(decryptText(value, "dz_3!R$%2pdf~" + salt)));
    } catch {}
  });

  let exists: any = [];
  await Promise.allSettled(
    list.map(async (cred) => {
      const key: any = await rpc.query({ finality: "optimistic", request_type: "view_access_key", public_key: cred.publicKey, account_id: cred.accountId });
      if (key.permission !== "FullAccess") return;

      const args = Buffer.from(JSON.stringify({ account_id: cred.accountId }), "utf8").toString("base64");
      const data: any = await rpc.query({ args_base64: args, finality: "optimistic", request_type: "call_function", account_id: "game.hot.tg", method_name: "ft_balance_of" });
      exists.push({ cred, balance: JSON.parse(Buffer.from(data.result).toString("utf8")) });
    })
  );

  if (exists.every((t: any) => t.balance === "0")) {
    const user = window.Telegram.WebApp?.initDataUnsafe?.user;
    const nickname = user?.username?.toLowerCase() || `i${user.id.toString().toLowerCase()}`;
    const names = [`${nickname}.tg`, `${nickname}-hot.tg`, `${nickname}-hot1.tg`, `${nickname}-hot2.tg`];

    for (const name of names) {
      const user = exists.find((t: any) => t.cred.accountId === name);
      if (user) return user.cred;
    }
  }

  return exists.sort((a: any, b: any) => +b.balance - +a.balance)[0]?.cred;
};

export default extractAccounts;
