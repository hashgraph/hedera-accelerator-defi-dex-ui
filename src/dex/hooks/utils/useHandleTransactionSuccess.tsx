import { toast } from "react-toastify";
import { TransactionResponse } from "@hashgraph/sdk";
import { Toast } from "@shared/ui-kit";
import { useNavigate } from "react-router-dom";
import { isNotNil } from "ramda";

export function useHandleTransactionSuccess() {
  const navigate = useNavigate();

  function handleTransactionSuccess(transactionResponse: TransactionResponse, message: string, pathTo?: string) {
    const transactionId = transactionResponse?.transactionId.toString();
    if (isNotNil(pathTo)) navigate(pathTo);
    toast.success(<Toast message={message} transactionId={transactionId} />);
  }

  return handleTransactionSuccess;
}
