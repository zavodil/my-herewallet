export const isTgProd = () => location.origin === "https://tgapp.herewallet.app";
export const isTgBeta = () => {
  if (process.env.NODE_ENV === "development") return true;
  return location.origin === "https://tgapp-dev.herewallet.app";
};

export const isTgMobile = () => isTgBeta() || isTgProd();
