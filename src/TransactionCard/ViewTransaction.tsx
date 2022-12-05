import { FC, ReactNode } from "react";
import FullPermissions from "../TransactionDetails/FullPermissions";
import AddPublicKey from "../TransactionDetails/AddPublicKey";
import FunctionCall from "../TransactionDetails/FunctionCall";
import TransferCall from "../TransactionDetails/TranserCall";
import AnyTransaction from "../TransactionDetails/AnyTransaction";
import SimpleLogin from "../TransactionDetails/SimpleLogin";
import { HereArguments } from "./utilts";

export const ViewTransaction: FC<{ children: ReactNode; args: HereArguments }> = ({ children, args }) => {
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

  return <SimpleLogin sidebar={children} />;
};
