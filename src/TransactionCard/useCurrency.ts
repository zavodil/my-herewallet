import { useEffect, useState } from "react";
import constants from "../constants";

const fetchCurrencies = async () => {
  const res = await fetch(`https://${constants.api}/api/v1/rate/all`);
  const data = await res.json();
  return data;
};

export const useUsdNear = () => {
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    fetchCurrencies().then(setList);
  }, []);

  return list?.rates.find((v: any) => v.currency === 1)?.rate ?? 1;
};
