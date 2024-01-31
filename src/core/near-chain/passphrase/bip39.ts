// @ts-nocheck
import { createHash, randomBytes, pbkdf2Sync as pbkdf2 } from "crypto";
import ENGLISH_WORDLIST from "./english.json";

var DEFAULT_WORDLIST = ENGLISH_WORDLIST;
var INVALID_MNEMONIC = "Invalid mnemonic";
var INVALID_ENTROPY = "Invalid entropy";
var INVALID_CHECKSUM = "Invalid mnemonic checksum";

function lpad(str: string, padString: string, length: number) {
  while (str.length < length) str = padString + str;
  return str;
}

function binaryToByte(bin: string) {
  return parseInt(bin, 2);
}

function bytesToBinary(bytes) {
  return bytes
    .map(function (x) {
      return lpad(x.toString(2), "0", 8);
    })
    .join("");
}

function deriveChecksumBits(entropyBuffer) {
  var ENT = entropyBuffer.length * 8;
  var CS = ENT / 32;
  var hash = createHash("sha256").update(entropyBuffer).digest();

  return bytesToBinary([].slice.call(hash)).slice(0, CS);
}

function salt(password) {
  return "mnemonic" + (password || "");
}

export function mnemonicToSeed(mnemonic, password) {
  var mnemonicBuffer = Buffer.from(mnemonic, "utf8");
  var saltBuffer = Buffer.from(salt(password), "utf8");

  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, "sha512");
}

export function mnemonicToSeedHex(mnemonic, password) {
  return mnemonicToSeed(mnemonic, password).toString("hex");
}

export function mnemonicToEntropy(mnemonic, wordlist) {
  wordlist = wordlist || DEFAULT_WORDLIST;

  var words = mnemonic.split(" ");
  if (words.length % 3 !== 0) throw new Error(INVALID_MNEMONIC);

  // convert word indices to 11 bit binary strings
  var bits = words
    .map(function (word) {
      var index = wordlist.indexOf(word);
      if (index === -1) throw new Error(INVALID_MNEMONIC);

      return lpad(index.toString(2), "0", 11);
    })
    .join("");

  // split the binary string into ENT/CS
  var dividerIndex = Math.floor(bits.length / 33) * 32;
  var entropyBits = bits.slice(0, dividerIndex);
  var checksumBits = bits.slice(dividerIndex);

  // calculate the checksum and compare
  var entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
  if (entropyBytes.length < 16) throw new Error(INVALID_ENTROPY);
  if (entropyBytes.length > 32) throw new Error(INVALID_ENTROPY);
  if (entropyBytes.length % 4 !== 0) throw new Error(INVALID_ENTROPY);

  var entropy = Buffer.from(entropyBytes);
  var newChecksum = deriveChecksumBits(entropy);
  if (newChecksum !== checksumBits) throw new Error(INVALID_CHECKSUM);

  return entropy.toString("hex");
}

export function entropyToMnemonic(entropy, wordlist = DEFAULT_WORDLIST) {
  if (!Buffer.isBuffer(entropy)) entropy = Buffer.from(entropy, "hex");

  // 128 <= ENT <= 256
  if (entropy.length < 16) throw new TypeError(INVALID_ENTROPY);
  if (entropy.length > 32) throw new TypeError(INVALID_ENTROPY);
  if (entropy.length % 4 !== 0) throw new TypeError(INVALID_ENTROPY);

  var entropyBits = bytesToBinary([].slice.call(entropy));
  var checksumBits = deriveChecksumBits(entropy);

  var bits = entropyBits + checksumBits;
  var chunks = bits.match(/(.{1,11})/g);
  var words = chunks.map(function (binary) {
    var index = binaryToByte(binary);
    return wordlist[index];
  });

  return words.join(" ");
}

export function generateMnemonic(strength = 128, rng = randomBytes, wordlist = DEFAULT_WORDLIST) {
  if (strength % 32 !== 0) throw new TypeError(INVALID_ENTROPY);
  return entropyToMnemonic(rng(strength / 8), wordlist);
}

export function validateMnemonic(mnemonic, wordlist = DEFAULT_WORDLIST) {
  try {
    mnemonicToEntropy(mnemonic, wordlist);
  } catch (e) {
    return false;
  }

  return true;
}
