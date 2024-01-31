import BN from "bn.js";

export const wait = (timeout: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout));
};

export const truncateAddress = (id: string) => {
  return id.length > 24 ? id.slice(0, 12) + ".." + id.slice(-12) : id;
};

export const chunk = (array: any[], chunkSize: number) => {
  const result: any[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
};

export function trimTrailingZeroes(value: string) {
  return value.replace(/\.?0*$/, "");
}

const ROUNDING_OFFSETS: BN[] = [];
const BN10 = new BN(10);
for (let i = 0, offset = new BN(5); i < 30; i++, offset = offset.mul(BN10)) {
  ROUNDING_OFFSETS[i] = offset;
}

export function formatAmount(balance: string | number, nominal = 24, fracDigits = 6) {
  try {
    const balanceBN = new BN(balance, 10);
    if (fracDigits !== nominal) {
      const roundingExp = nominal - fracDigits - 1;
      if (roundingExp > 0) {
        balanceBN.iadd(ROUNDING_OFFSETS[roundingExp]);
      }
    }

    balance = balanceBN.toString();
    const wholeStr = balance.substring(0, balance.length - nominal) || "0";
    const fractionStr = balance
      .substring(balance.length - nominal)
      .padStart(nominal, "0")
      .substring(0, fracDigits);

    return +trimTrailingZeroes(`${wholeStr}.${fractionStr}`);
  } catch {
    return 0;
  }
}

export function parseAmount(amt: string | number, nominal = 24) {
  try {
    amt = cleanupAmount(amt.toString());
    const split = amt.split(".");
    const wholePart = split[0];
    const fracPart = split[1]?.substring(0, nominal) || "";
    return trimLeadingZeroes(wholePart + fracPart.padEnd(nominal, "0"));
  } catch {
    return "0";
  }
}

function cleanupAmount(amount: string) {
  return amount.replace(/,/g, "").trim();
}

function trimLeadingZeroes(value: string) {
  value = value.replace(/^0+/, "");
  if (value === "") return "0";
  return value;
}

type Value = string | number | undefined | null;

export class Formatter {
  static localCurrency = "USD";
  static usd2currency: Record<string, number> = { RUB: 72 };
  static symbols: Record<string, (v: number) => string> = {
    USD: (v) => "$" + v,
    RUB: (v) => v + " RUB",
  };

  static address(id: string, max = 16) {
    return id.length > max ? `${id.slice(0, max / 2)}...${id.slice(-max / 2)}` : id;
  }

  static round(value: Value, dec = 2) {
    const decimal = Math.pow(10, dec);
    return Math.floor(Formatter.num(value) * decimal) / decimal;
  }

  static usdNumber(value: Value, dec = 2) {
    const course = Formatter.usd2currency[Formatter.localCurrency] ?? 1;
    const num = Formatter.num(value);
    return Formatter.round(num * course, dec);
  }

  static usd(value: Value, dec = 2) {
    const defaultFormat = (v: number) => Formatter.localCurrency + v;
    const symbol = Formatter.symbols[Formatter.localCurrency] ?? defaultFormat;

    const num = Formatter.usdNumber(value, dec);
    return (num >= 0 ? "" : "-") + symbol(num);
  }

  static num(value: Value) {
    if (value == null) return 0;
    return isNaN(+value) ? 0 : +value;
  }
}

export const isAndroid = () => navigator.userAgent.toLowerCase().indexOf("android") > -1;

export const isIOS = () => {
  return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

export const getStorageJson = (key: string, def: any) => {
  try {
    return JSON.parse(localStorage.getItem(key)!) ?? def;
  } catch {
    return def;
  }
};

export const recaptchaToken = async (): Promise<string> => {
  // @ts-ignore
  if (process.env.NODE_ENV === "development") return undefined;
  return new Promise((resolve, reject) => {
    const repatcha = (window as any).grecaptcha;
    if (repatcha == null) return reject("repatcha is invalid");
    repatcha.ready(() => {
      repatcha.execute("6LezLUUpAAAAAB52b8j8t-wSZHifwVFT3Qe_MzSE", { action: "submit" }).then(resolve).catch(reject);
    });
  });
};
