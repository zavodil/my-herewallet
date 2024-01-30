import BN from "bn.js";
import { parseAmount } from "../helpers";
import { NearAccount } from "./NearAccount";
import { TGAS } from "./constants";

class NeatToken {
  constructor(readonly wallet: NearAccount) {}

  async getBalance() {
    const res = await fetch("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
      body: JSON.stringify({
        query: `query {
          holderInfos(where: { accountId: "${this.wallet.accountId}", ticker: "neat" }) {
            accountId
            amount
          }
        }
        `,
      }),
      method: "POST",
    });

    const { data } = await res.json();
    return data?.holderInfos[0]?.amount ?? "0";
  }

  async adjust(amount: string | BN): Promise<BN> {
    const balance = await this.getBalance();
    return BN.min(new BN(balance), new BN(amount));
  }

  async wrap(amount: string | BN) {
    const tx = await this.wallet.callTransaction({
      receiverId: "neat.nrc-20.near",
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "ft_wrap",
            deposit: parseAmount("0.01"),
            args: { amount: amount.toString() },
            gas: 50 * TGAS,
          },
        },
      ],
    });

    return tx;
  }
}

export default NeatToken;
