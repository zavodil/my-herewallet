import { FC, ReactNode } from "react";
import FullPermissions from "../TransactionDetails/FullPermissions";
import AddPublicKey from "../TransactionDetails/AddPublicKey";
import FunctionCall from "../TransactionDetails/FunctionCall";
import TransferCall from "../TransactionDetails/TranserCall";
import AnyTransaction from "../TransactionDetails/AnyTransaction";
import SimpleLogin from "../TransactionDetails/SimpleLogin";
import { HereProviderRequest } from "@here-wallet/core";
import { BN } from "bn.js";

export const ViewTransaction: FC<{ children: ReactNode; request: HereProviderRequest }> = ({ children, request }) => {
  if (request.transactions.length) {
    const network = request.network ?? "mainnet";
    const trx = request.transactions[0];
    const action = trx.actions[0];
    const receiver = trx.receiverId ?? "Your wallet";

    if (action.type === "FunctionCall") {
      return (
        <FunctionCall
          network={network}
          receiver={receiver}
          amount={new BN(action.params.deposit)}
          gas={new BN(action.params.gas)}
          method={action.params.methodName}
          sidebar={children}
        />
      );
    }

    if (action.type === "AddKey") {
      if (action.params.accessKey.permission === "FullAccess") {
        return <FullPermissions network={network} sidebar={children} />;
      }
      return (
        <AddPublicKey
          network={network}
          contract={action.params.accessKey.permission.receiverId}
          methods={action.params.accessKey.permission.methodNames ?? []}
          sidebar={children}
        />
      );
    }

    if (action.type === "Transfer") {
      return (
        <TransferCall network={network} receiver={receiver} amount={new BN(action.params.deposit)} sidebar={children} />
      );
    }

    const actions = trx.actions.map((act) => act.type);
    return <AnyTransaction network={network} receiver={receiver} actions={actions} sidebar={children} />;
  }

  return <SimpleLogin network="mainnet" sidebar={children} />;
};
