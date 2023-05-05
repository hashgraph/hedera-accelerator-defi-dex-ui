import { useMutation } from "react-query";
import { DAOMutations, useDexContext } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@services";

interface UseApproveTransactionParams {
  safeId: string;
  transactionHash: string;
}

export function useApproveTransaction() {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseApproveTransactionParams,
    DAOMutations.ApproveTransaction
  >(async (params: UseApproveTransactionParams) => {
    const { safeId, transactionHash } = params;
    return DexService.sendApproveMultiSigTransaction(safeId, transactionHash, signer);
  });
}
