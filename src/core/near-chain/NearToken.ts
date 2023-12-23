import { NearAccount } from "./NearAccount";

class NearToken {
  public balance = "0";
  public safe = "0";

  constructor(readonly wallet: NearAccount) {}

  async fetchBalance() {
    const { total, available } = await this.wallet.getNativeBalance();
    this.balance = total.toString();
    this.safe = available.toString();
  }
}

export default NearToken;
