// @ts-nocheck
import { base_encode } from "near-api-js/lib/utils/serialize";
import nacl from "tweetnacl";

import { derivePath } from "./near-hd-key";
import * as bip39 from "./bip39";

export const KEY_DERIVATION_PATH = "m/44'/397'/0'";

export const generateSeedPhrase = (entropy?: Uint8Array) => {
  return parseSeedPhrase(entropy !== undefined ? bip39.entropyToMnemonic(entropy) : bip39.generateMnemonic());
};

export const normalizeSeedPhrase = (seedPhrase) =>
  seedPhrase
    .trim()
    .split(/\s+/)
    .map((part) => part.toLowerCase())
    .join(" ");

export const parseSeedPhrase = (seedPhrase, derivationPath = KEY_DERIVATION_PATH) => {
  const seed = bip39.mnemonicToSeed(normalizeSeedPhrase(seedPhrase));
  const { key } = derivePath(derivationPath, seed.toString("hex"));
  const keyPair = nacl.sign.keyPair.fromSeed(key);
  const publicKey = "ed25519:" + base_encode(Buffer.from(keyPair.publicKey));
  const secretKey = "ed25519:" + base_encode(Buffer.from(keyPair.secretKey));
  return { seedPhrase, secretKey, publicKey, defaultAddress: Buffer.from(keyPair.publicKey).toString("hex") };
};

export const findSeedPhraseKey = (seedPhrase, publicKeys) => {
  // TODO: Need to iterate through multiple possible derivation paths?
  const keyInfo = parseSeedPhrase(seedPhrase);
  if (publicKeys.indexOf(keyInfo.publicKey) < 0) {
    return {};
  }
  return keyInfo;
};
