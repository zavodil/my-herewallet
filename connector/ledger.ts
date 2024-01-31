import LedgerTransportWebUsb from "@ledgerhq/hw-transport-webusb";
import Near from "@ledgerhq/hw-app-near";

import { Signature } from "near-api-js/lib/utils/key_pair";
import { PublicKey } from "near-api-js/lib/utils";
import { Signer } from "near-api-js";

class LedgerSigner implements Signer {
  constructor(readonly path = "44'/397'/0'/0'/1'", readonly toggleConnect: (v: boolean) => void, readonly onSigned: () => void) {}

  createKey(): Promise<PublicKey> {
    throw new Error("Method not implemented.");
  }

  async getAddress(): Promise<{ address: string; publicKey: PublicKey }> {
    const near = await this.connectNear();
    const { address, publicKey } = await near.getAddress(this.path);
    return { address, publicKey: PublicKey.from(publicKey) };
  }

  async getPublicKey(): Promise<PublicKey> {
    const near = await this.connectNear();
    const { publicKey } = await near.getAddress(this.path);
    return PublicKey.from(publicKey);
  }

  async signMessage(message: Uint8Array): Promise<Signature> {
    const near = await this.connectNear();
    const publicKey = await this.getPublicKey();
    const signature = await near.signTransaction(message, this.path);
    if (signature == null) {
      this.toggleConnect(false);
      throw Error("Signature is not allowed");
    }

    this.onSigned();
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
