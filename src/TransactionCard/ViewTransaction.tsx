import { Transaction } from "near-api-js/lib/transaction";
import { FC, ReactNode, useState } from "react";
import { Buffer } from "buffer";

import FullPermissions from "../TransactionDetails/FullPermissions";
import AddPublicKey from "../TransactionDetails/AddPublicKey";
import FunctionCall from "../TransactionDetails/FunctionCall";
import TransferCall from "../TransactionDetails/TranserCall";
import AnyTransaction from "../TransactionDetails/AnyTransaction";
import InvalidTransaction from "./InvalidTransaction";

const parseArguments = () => {
  const params = new URLSearchParams(window.location.search);
  const contractId = params.get("contract_id");
  const publicKey = params.get("public_key");
  const methodNames = params.get("methodNames")?.split(",") ?? [];

  const messages = params.get("transactions")?.split(",") ?? [];
  const transactions = messages
    .map((msg) => {
      try {
        return Transaction.decode(Buffer.from(msg, "base64"));
      } catch (e) {
        console.log(e);
        return null;
      }
    })
    .filter((v): v is Transaction => v != null);

  return {
    transactions,
    contractId,
    publicKey,
    methodNames,
  };
};

export const ViewTransaction: FC<{ children: ReactNode }> = ({ children }) => {
  const [args] = useState(() => parseArguments());
  const { transactions, methodNames, publicKey, contractId } = args;

  if (transactions.length) {
    const trx = transactions[0];
    const action = trx.actions[0];

    if (action.enum === "functionCall") {
      return (
        <FunctionCall
          receiver={trx.receiverId}
          amount={action.functionCall.deposit}
          gas={action.functionCall.gas}
          method={action.functionCall.methodName}
          sidebar={children}
        />
      );
    }

    if (action.enum === "transfer") {
      return <TransferCall receiver={trx.receiverId} amount={action.transfer.deposit} sidebar={children} />;
    }

    const actions = trx.actions.map((act) => act.enum);
    return <AnyTransaction receiver={trx.receiverId} actions={actions} sidebar={children} />;
  }

  if (contractId != null && publicKey != null) {
    return <AddPublicKey contract={contractId} methods={methodNames} sidebar={children} />;
  }

  if (publicKey != null) {
    return <FullPermissions sidebar={children} />;
  }

  return <InvalidTransaction />;
};
