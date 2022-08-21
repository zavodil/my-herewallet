import { useEffect, useState } from "react";

const fetchCurrencies = async () => {
    const res = await fetch('https://api.herewallet.app/api/v1/rate/all');
    const data = await res.json()
    return data
}

export const useUsdNear = () => {
    const [list, setList] = useState<any>(null)

    useEffect(() => {
        fetchCurrencies().then(setList)
    }, [])

    return list?.rates.find((v: any) => v.currency === 1)?.rate ?? 1;
}