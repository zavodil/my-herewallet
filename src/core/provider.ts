import {
  HereProvider,
  HereProviderError,
  HereProviderResult,
  HereProviderStatus,
} from "@here-wallet/core/src/provider";
import {
  createRequest,
  getResponse,
  deleteRequest,
  proxyApi,
  getRequest,
} from "@here-wallet/core/src/here-provider/methods";
import { HereProviderOptions } from "@here-wallet/core";
import { ConnectType } from "./types";

export { createRequest, getResponse, deleteRequest, proxyApi, getRequest };

type ProxyType = (
  options: HereProviderOptions & { selector?: { id: string; type: ConnectType } }
) => Promise<HereProviderResult>;

export const proxyProvider: ProxyType = async (conf) => {
  let { strategy, request, disableCleanupRequest, id, signal, selector, ...delegate } = conf;
  // @ts-ignore
  request.selector = selector;

  if (id != null) request = await getRequest(id, signal);
  else id = await createRequest(request, signal);

  return new Promise<HereProviderResult>((resolve, reject: (e: HereProviderError) => void) => {
    let fallbackHttpTimer: NodeJS.Timeout | number | null = null;
    let socket: WebSocket | null = null;

    const clear = async () => {
      fallbackHttpTimer = -1;
      clearInterval(fallbackHttpTimer);
      socket?.close();
      if (disableCleanupRequest !== true) {
        await deleteRequest(id!);
      }
    };

    const processApprove = (data: HereProviderResult) => {
      switch (data.status) {
        case HereProviderStatus.APPROVING:
          delegate.onApproving?.(data);
          strategy?.onApproving?.(data);
          return;

        case HereProviderStatus.FAILED:
          clear();
          reject(new HereProviderError(data.payload));
          delegate.onFailed?.(data);
          strategy?.onFailed?.(data);
          return;

        case HereProviderStatus.SUCCESS:
          clear();
          resolve(data);
          delegate.onSuccess?.(data);
          strategy?.onSuccess?.(data);
          return;
      }
    };

    const rejectAction = (payload?: string) => {
      processApprove({ status: HereProviderStatus.FAILED, payload });
    };

    delegate.onRequested?.(id!, request, rejectAction);
    strategy?.onRequested?.(id!, request, rejectAction);
    signal?.addEventListener("abort", () => rejectAction());

    const setupTimer = () => {
      if (fallbackHttpTimer === -1) {
        return;
      }

      fallbackHttpTimer = setTimeout(async () => {
        try {
          const data = await getResponse(id!);
          if (fallbackHttpTimer === -1) return;
          processApprove(data);
          setupTimer();
        } catch (e) {
          const status = HereProviderStatus.FAILED;
          const error = e instanceof Error ? e : undefined;
          const payload = error?.message;

          clear();
          reject(new HereProviderError(payload, error));
          delegate.onFailed?.({ status, payload });
          strategy?.onFailed?.({ status, payload });
        }
      }, 3000);
    };

    setupTimer();
  });
};
