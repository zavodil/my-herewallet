import { Transaction } from "near-api-js/lib/transaction";
import { FC, ReactNode, useState } from "react";
import { Buffer } from "buffer";

import FullPermissions from "../TransactionDetails/FullPermissions";
import AddPublicKey from "../TransactionDetails/AddPublicKey";
import FunctionCall from "../TransactionDetails/FunctionCall";
import TransferCall from "../TransactionDetails/TranserCall";
import AnyTransaction from "../TransactionDetails/AnyTransaction";
import SimpleLogin from "../TransactionDetails/SimpleLogin";
import VerifyOwner from "../TransactionDetails/VerifyOwner";

const parseArguments = (params: any) => {
  const contractId = params["contract_id"];
  const publicKey = params["public_key"];
  const message = params["message"];
  const methodNames = params["methodNames"]?.split(",") ?? [];

  const messages: string[] = params["transactions"]?.split(",") ?? [];
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
    message,
    transactions,
    contractId,
    publicKey,
    methodNames,
  };
};

export const ViewTransaction: FC<{ children: ReactNode; params: Object }> = ({ children, params }) => {
  const [args] = useState(() => parseArguments(params));
  const { message, transactions, methodNames, publicKey, contractId } = args;

  if (message != null) {
    return <VerifyOwner sidebar={children} message={message} />;
  }

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

  return <SimpleLogin sidebar={children} />;
};
