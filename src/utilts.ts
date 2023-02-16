import BN from "bn.js";

export function trimTrailingZeroes(value: string) {
  return value.replace(/\.?0*$/, "");
}

export function formatWithCommas(value: string) {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.replace(pattern, "$1,$2");
  }
  return value;
}

const ROUNDING_OFFSETS: BN[] = [];
const BN10 = new BN(10);
for (let i = 0, offset = new BN(5); i < 30; i++, offset = offset.mul(BN10)) {
  ROUNDING_OFFSETS[i] = offset;
}

export function formatAmount(balance: string, nominal = 24, fracDigits = 6) {
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
  return trimTrailingZeroes(`${formatWithCommas(wholeStr)}.${fractionStr}`);
}

export const isAndroid = () => navigator.userAgent.toLowerCase().indexOf("android") > -1; 

export const isIOS = () => {
  return (
    ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};
