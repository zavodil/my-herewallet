import { HereProviderRequest, HereProviderResult, HereProviderStatus } from "@here-wallet/core";
import { NearSnap, NearSnapAccount, TransactionSignRejected } from "@near-snap/sdk";

const snap = new NearSnap();

export enum ConnectType {
  Web = "web",
  Ledger = "ledger",
  Here = "here",
  Snap = "snap",
  Local = "local",
  WalletConnect = "wallet-connect",
}

export const getStorageJson = (key: string, def: any) => {
  try {
    return JSON.parse(localStorage.getItem(key)!) ?? def;
  } catch {
    return def;
  }
};

const sendResponse = async (id: string, data: HereProviderResult) => {
  const res = await fetch(`https://h4n.app/${id}/response`, {
    body: JSON.stringify({ data: JSON.stringify(data) }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (!res.ok) throw Error();
};

// export const connectLedger = async (
//   account: { id: string; type: ConnectType; path?: string },
//   requestId: string,
//   request: HereProviderRequest,
//   onConnected: (is: boolean) => void,
//   onSigned: () => void,
//   onNeedActivate: (v: string) => void
// ) => {
//   try {
//     const path = account.path;
//     const ledger = new LedgerSigner(path, onConnected, onSigned);

//     if (request.type === "sign") {
//       const { address, publicKey } = await ledger.getAddress();
//       await sendResponse(requestId, {
//         type: ConnectType.Ledger,
//         status: HereProviderStatus.FAILED,
//         public_key: publicKey.toString(),
//         payload: publicKey.toString(),
//         account_id: address,
//       });
//       window.close();
//       return;
//     }

//     if (request.type === "call") {
//       const { address, publicKey } = await ledger.getAddress();
//       const account = new NearAccount(address, ConnectType.Ledger, ledger);
//       const isAccess = await account.getAccessKeyInfo(address, publicKey).catch(() => null);

//       if (!isAccess) {
//         onNeedActivate(address);
//         return;
//       }

//       const result = await account.sendLocalTransactions(request.transactions, true);
//       await sendResponse(requestId, {
//         type: ConnectType.Ledger,
//         status: HereProviderStatus.SUCCESS,
//         public_key: publicKey.toString(),
//         payload: result.map((t) => t).join(","),
//         account_id: address,
//         path: path,
//       });
//     }
//   } catch (e) {
//     onConnected(false);
//     throw e;
//   }
// };

export const connectMetamask = async (accountId: string, requestId: string, request: HereProviderRequest) => {
  try {
    await snap.install();
    await sendResponse(requestId, {
      status: HereProviderStatus.APPROVING,
      type: ConnectType.Snap,
    });

    if (request.type === "sign") {
      if (!("recipient" in request)) throw Error();
      const result = await snap.signMessage({
        network: (request.network as any) || "mainnet",
        recipient: request.recipient,
        message: request.message,
        nonce: request.nonce,
      });

      if (result == null) throw Error();
      await sendResponse(requestId, {
        type: ConnectType.Snap,
        status: HereProviderStatus.SUCCESS,
        public_key: result.publicKey,
        account_id: result.accountId,
        payload: JSON.stringify({
          signature: result.signature,
          accountId: result.accountId,
          publicKey: result.publicKey,
        }),
      });
    }

    if (request.type === "call") {
      await sendResponse(requestId, { status: HereProviderStatus.APPROVING, type: ConnectType.Snap }).catch(() => {});
      const network = (request.network as any) || "mainnet";

      let account = await NearSnapAccount.restore({ snap, network });
      if (!account) account = await NearSnapAccount.connect({ snap, network });
      if (account == null) throw Error();

      const trxs = request.transactions.map((t) => ({
        receiverId: t.receiverId || account!.accountId,
        signerId: account!.accountId,
        actions: t.actions,
      }));

      const result = await account.executeTransactions(trxs as any);
      await sendResponse(requestId, {
        status: HereProviderStatus.SUCCESS,
        payload: result.map((t) => t.transaction_outcome.id).join(","),
        public_key: account.publicKey?.toString(),
        account_id: account.accountId,
        type: ConnectType.Snap,
      });
    }
  } catch (e: any) {
    if (e instanceof TransactionSignRejected) throw e;
    await sendResponse(requestId, {
      status: HereProviderStatus.FAILED,
      payload: e?.toString?.(),
      type: ConnectType.Snap,
    });
  }
};
