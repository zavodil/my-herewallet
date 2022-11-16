import { useCallback, useEffect, useState } from "react";
import uuid4 from "uuid4";

import constants from "../constants";
import { failureRedirect, successRedirect } from "./redirects";
import { createRequest, getTransactionStatus } from "./utilts";
import { RequestData } from "./types";

const getCachedRequestId = () => {
  const query = new URLSearchParams(window.location.search);
  const id = query.get("request_id");
  return id || null;
};

export const useSignRequest = () => {
  const [requested] = useState(() => getCachedRequestId() || uuid4());
  const [params, setParams] = useState<null | Object>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const processApprove = useCallback(
    (approved: RequestData) => {
      const statues: Record<number, () => void> = {
        1: () => setLoading(true),
        2: () => failureRedirect(approved),
        3: () => successRedirect(approved),
      };

      statues[approved.status]?.();
    },
    [setLoading]
  );

  useEffect(() => {
    let socket: WebSocket;
    let timer: NodeJS.Timeout | undefined | -1;

    const init = async () => {
      if (getCachedRequestId() == null) {
        await createRequest(requested);
        changeSearch({ request_id: requested });
      }

      const setupTimer = () => {
        if (timer === -1) return;
        timer = setTimeout(async () => {
          const data: any = await getTransactionStatus(requested).catch(() => {});
          processApprove(data);
          setupTimer();
        }, 3000);
      };

      const data: any = await getTransactionStatus(requested).catch(() => setError(true));
      const query = new URLSearchParams(new URL(data.transaction).search);
      const params = Object.fromEntries(query.entries());
      setParams(params);

      processApprove(data);
      setupTimer();

      const transaction = data.transaction;
      const endpoint = `wss://${constants.api}/api/v1/web/ws/transaction_approved/${requested}`;
      socket = new WebSocket(endpoint);
      socket.onerror = (e) => console.log(e); // TODO
      socket.onclose = (e) => console.log(e); // TODO
      socket.onmessage = (e) => {
        if (e.data == null) return;
        try {
          const data = JSON.parse(e.data);
          processApprove({ ...data, transaction });
        } catch {}
      };
    };

    init();
    return () => {
      socket?.close();
      clearTimeout(timer);
      timer = -1;
    };
  }, [requested, processApprove]);

  return {
    deeplink: `${constants.host}/sign_request?${requested}`,
    params,
    error,
    isLoading,
  };
};

export const changeSearch = (data: Record<string, string>) => {
  const search = new URLSearchParams(data);
  const base = window.location.origin + window.location.pathname + "?" + search;
  window.history.replaceState({}, document.title, base);
};
