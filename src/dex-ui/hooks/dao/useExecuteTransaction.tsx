import { useMutation } from "react-query";
import { DAOMutations, useDexContext } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@services";

interface UseExecuteTransactionParams {
  safeId: string;
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
}

export function useExecuteTransaction() {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseExecuteTransactionParams,
    DAOMutations.ExecuteTransaction
  >(async (params: UseExecuteTransactionParams) => {
    const { safeId, msgValue, hexStringData, operation, nonce } = params;
    return DexService.sendExecuteMultiSigTransaction({ safeId, msgValue, hexStringData, operation, nonce, signer });
  });
}
