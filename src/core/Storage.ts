// @ts-ignore
import aesjs from "aes-js";
// @ts-ignore
import pbkdf2 from "pbkdf2";
import crypto from "crypto";
import { ConnectType, UserCred } from "./types";

export class Storage {
  static memoryData: Record<string, any> = {};
  constructor(readonly id: string) {}

  set(key: string, value: any) {
    try {
      localStorage.setItem(this.id + ":" + key, value);
    } catch {
      Storage.memoryData[this.id + ":" + key] = value;
      parent.postMessage({ action: "saveLocalStorage", data: Storage.memoryData }, "*");
    }
  }

  get(key: string): string | null {
    try {
      return localStorage.getItem(this.id + ":" + key) || null;
    } catch {
      return Storage.memoryData[this.id + ":" + key] || null;
    }
  }
}

const encryptText = (text: string, password: string) => {
  const textInBase64 = btoa(unescape(encodeURIComponent(text)));
  let textWithPadding = textInBase64;
  if (textWithPadding.length % 16 != 0) {
    textWithPadding += "=".repeat(16 - (textWithPadding.length % 16));
  }

  const textInBytes = aesjs.utils.utf8.toBytes(textWithPadding);
  const derivedKey = pbkdf2.pbkdf2Sync(password, "salt", 1, 256 / 8, "sha512");
  const generatedIV = crypto.randomBytes(16);

  const aesCBC = new aesjs.ModeOfOperation.cbc(derivedKey, generatedIV);
  const encryptedTextInBytes = aesCBC.encrypt(textInBytes);
  const encryptedTextInHex = aesjs.utils.hex.fromBytes(encryptedTextInBytes);
  const generatedIVInHex = aesjs.utils.hex.fromBytes(generatedIV);
  const cipherText = generatedIVInHex + ":" + encryptedTextInHex;
  return cipherText;
};

const decryptText = (cipherText: string, password: string) => {
  const derivedKey = pbkdf2.pbkdf2Sync(password, "salt", 1, 256 / 8, "sha512");
  const splitCipherText = cipherText.split(":");

  const ivInHex = splitCipherText[0];
  const encryptedHex = splitCipherText[1];

  const iv = aesjs.utils.hex.toBytes(ivInHex);
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

  const aesCBC = new aesjs.ModeOfOperation.cbc(derivedKey, iv);
  const decryptedBytes = aesCBC.decrypt(encryptedBytes);

  let decryptedTextInBase64 = aesjs.utils.utf8.fromBytes(decryptedBytes);
  decryptedTextInBase64 = decryptedTextInBase64.replace(/=/g, "");

  const decryptedText = decodeURIComponent(escape(atob(decryptedTextInBase64)));
  return decryptedText;
};

export const encryptedStorage = (pwd: string) => {
  try {
    const text = localStorage.getItem("storage") || "";
    JSON.parse(decryptText(text, pwd));

    return {
      set: (data: object) => {
        localStorage.setItem("storage", encryptText(JSON.stringify(data), pwd));
      },

      get: () => {
        const text = localStorage.getItem("storage") || "";
        return JSON.parse(decryptText(text, pwd));
      },
    };
  } catch {
    return null;
  }
};

interface StorageData {
  accounts: { id: string; type: ConnectType }[];
  activeAccount: string | null;
}

const pwd = "dz_3!R$%2pdf~";

class SecureStorage {
  read(): StorageData {
    try {
      const text = localStorage.getItem("storage")!;
      return JSON.parse(decryptText(text, pwd));
    } catch {
      return { accounts: [], activeAccount: null };
    }
  }

  write(data: StorageData) {
    localStorage.setItem("storage", encryptText(JSON.stringify(data), pwd));
  }

  addAccount(data: UserCred) {
    const salt = crypto.createHash("sha256").update(data.accountId).digest().toString("hex");
    localStorage.setItem(data.accountId, encryptText(JSON.stringify(data), pwd + salt));

    const storage = this.read();
    storage.activeAccount = data.accountId;
    storage.accounts.push({ id: data.accountId, type: data.type });
    this.write(storage);
  }

  removeAccount(id: string) {
    const storage = this.read();

    storage.accounts = storage.accounts.filter((t) => t.id !== id);
    if (storage.activeAccount === id) {
      storage.activeAccount = storage.accounts[0]?.id || null;
    }

    localStorage.removeItem(id);
    this.write(storage);
  }

  selectAccount(id: string) {
    const storage = this.read();
    storage.activeAccount = id;
    this.write(storage);
  }

  getAccount(id: string): UserCred | null {
    try {
      const text = localStorage.getItem(id)!;
      const salt = crypto.createHash("sha256").update(id).digest().toString("hex");
      return JSON.parse(decryptText(text, pwd + salt));
    } catch {
      return null;
    }
  }
}

export const storage = new SecureStorage();
