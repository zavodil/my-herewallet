import { HereProviderRequest, HereProviderResult, HereProviderStatus } from "@here-wallet/core";
import { NearSnap, NearSnapAccount, TransactionSignRejected } from "@near-snap/sdk";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { InMemorySigner, KeyPair } from "near-api-js";

import { NearAccount } from "../core/near-chain/NearAccount";
import { ConnectType } from "../core/types";
import { storage } from "../core/Storage";
import LedgerSigner from "./ledger";
import { notify } from "../core/toast";

const snap = new NearSnap();

const sendResponse = async (id: string, data: HereProviderResult) => {
  const res = await fetch(`https://h4n.app/${id}/response`, {
    body: JSON.stringify({ data: JSON.stringify(data) }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (!res.ok) throw Error();
};

export const connectLedger = async (
  account: { id: string; type: ConnectType; path?: string },
  requestId: string,
  request: HereProviderRequest,
  onConnected: (is: boolean) => void,
  onSigned: () => void,
  onNeedActivate: (v: string) => void
) => {
  const creds = storage.getAccount(account.id);
  const path = creds?.path || account.path;
  const ledger = new LedgerSigner(path, onConnected, onSigned);

  if (request.type === "sign") {
    const { address, publicKey } = await ledger.getAddress();
    await sendResponse(requestId, {
      type: ConnectType.Ledger,
      status: HereProviderStatus.FAILED,
      public_key: publicKey.toString(),
      payload: publicKey.toString(),
      account_id: address,
    });
  }

  if (request.type === "call") {
    const { address, publicKey } = await ledger.getAddress();
    const creds = storage.getAccount(address);
    const account = new NearAccount(address, ConnectType.Ledger, ledger, creds?.jwt);
    const isAccess = await account.getAccessKeyInfo(address, publicKey).catch(() => null);

    if (!isAccess) {
      onNeedActivate(address);
      return;
    }

    const result = await account.sendLocalTransactions(request.transactions, true);

    await sendResponse(requestId, {
      type: ConnectType.Ledger,
      status: HereProviderStatus.SUCCESS,
      public_key: publicKey.toString(),
      payload: result.map((t) => t).join(","),
      account_id: address,
      path: path,
    });
  }
};

export const connectWeb = async (accountId: string, requestId: string, request: HereProviderRequest) => {
  try {
    const creds = storage.getAccount(accountId);
    const keyStore = new InMemoryKeyStore();
    if (!creds?.privateKey) return;

    const keyPair = KeyPair.fromString(creds.privateKey);
    await keyStore.setKey("mainnet", creds.accountId, keyPair);
    const signer = new InMemorySigner(keyStore);
    const account = new NearAccount(creds.accountId, ConnectType.Local, signer, creds.jwt);

    if (request.type === "sign") {
      if (!("recipient" in request))
        return await sendResponse(requestId, {
          status: HereProviderStatus.FAILED,
          type: ConnectType.Web,
        });

      const { accountId, publicKey, signature } = await account.signMessage({
        message: request.message,
        nonce: Buffer.from(request.nonce),
        recipient: request.recipient,
      });

      await sendResponse(requestId, {
        type: ConnectType.Web,
        status: HereProviderStatus.SUCCESS,
        public_key: publicKey,
        account_id: accountId,
        payload: JSON.stringify({
          signature: signature,
          accountId: accountId,
          publicKey: publicKey,
          type: ConnectType.Web,
        }),
      });
    }

    if (request.type === "call") {
      await sendResponse(requestId, { type: ConnectType.Web, status: HereProviderStatus.APPROVING }).catch(() => {});
      const result = await account.sendLocalTransactions(request.transactions, true);
      await sendResponse(requestId, {
        account_id: account.accountId,
        status: HereProviderStatus.SUCCESS,
        public_key: (await account.getPublicKey()).toString(),
        payload: result.map((t) => t).join(","),
        type: ConnectType.Web,
      });
    }
  } catch (e: any) {
    if (e?.message) notify(e?.message);
    await sendResponse(requestId, {
      status: HereProviderStatus.FAILED,
      type: ConnectType.Web,
    });
  }
};

export const connectMetamask = async (accountId: string, requestId: string, request: HereProviderRequest) => {
  try {
    await snap.install();
    await sendResponse(requestId, {
      status: HereProviderStatus.APPROVING,
      type: ConnectType.Snap,
    });

    if (request.type === "sign") {
      if (!("recipient" in request)) {
        return await sendResponse(requestId, {
          status: HereProviderStatus.FAILED,
          type: ConnectType.Snap,
        });
      }

      const result = await snap.signMessage({
        network: (request.network as any) || "mainnet",
        recipient: request.recipient,
        message: request.message,
        nonce: request.nonce,
      });

      if (result == null) {
        return await sendResponse(requestId, {
          status: HereProviderStatus.FAILED,
          type: ConnectType.Snap,
        });
      }

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
      await sendResponse(requestId, {
        type: ConnectType.Snap,
        status: HereProviderStatus.APPROVING,
      }).catch(() => {});

      const network = (request.network as any) || "mainnet";
      const account = await NearSnapAccount.restore({ snap, network }).catch(async () => {
        return await NearSnapAccount.connect({ snap, network });
      });

      if (account == null)
        return await sendResponse(requestId, {
          type: ConnectType.Snap,
          status: HereProviderStatus.FAILED,
        });

      const trxs = request.transactions.map((t) => ({
        receiverId: t.receiverId || account.accountId,
        signerId: account.accountId,
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
  } catch (e) {
    if (e instanceof TransactionSignRejected) throw e;
    await sendResponse(requestId, {
      status: HereProviderStatus.FAILED,
      type: ConnectType.Snap,
    });
  }
};
