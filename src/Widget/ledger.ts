import LedgerTransportWebUsb from "@ledgerhq/hw-transport-webusb";
import Near from "@ledgerhq/hw-app-near";

import { Signature } from "near-api-js/lib/utils/key_pair";
import { PublicKey } from "near-api-js/lib/utils";
import { Signer } from "near-api-js";

class LedgerSigner implements Signer {
  constructor(readonly toggleConnect: (v: boolean) => void) {}

  createKey(): Promise<PublicKey> {
    throw new Error("Method not implemented.");
  }

  async getAddress(): Promise<{ address: string; publicKey: PublicKey }> {
    const near = await this.connectNear();
    const { address, publicKey } = await near.getAddress("44'/397'/0'/0'/1'");
    return { address, publicKey: PublicKey.from(publicKey) };
  }

  async getPublicKey(): Promise<PublicKey> {
    const near = await this.connectNear();
    const { publicKey } = await near.getAddress("44'/397'/0'/0'/1'");
    return PublicKey.from(publicKey);
  }

  async signMessage(message: Uint8Array): Promise<Signature> {
    const near = await this.connectNear();
    const publicKey = await this.getPublicKey();

    console.log("signMessage", message, publicKey);
    const signature = await near.signTransaction(message, "44'/397'/0'/0'/1'");
    if (signature == null) throw Error("Signature is not allowed");
    return { signature, publicKey };
  }

  async connectNear(): Promise<Near> {
    let transport = await LedgerTransportWebUsb.openConnected();
    if (transport == null) return new Near(await LedgerTransportWebUsb.create());
    transport.on("disconnect", () => this.toggleConnect(false));
    this.toggleConnect(true);
    return new Near(transport);
  }
}

export default LedgerSigner;
