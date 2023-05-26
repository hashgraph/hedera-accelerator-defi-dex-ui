import { useMutation, useQueryClient } from "react-query";
import { DAOMutations, DAOQueries, HandleOnSuccess, useDexContext } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@services";
import { isNil } from "ramda";

interface UseExecuteTransactionParams {
  safeId: string;
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
}

export function useExecuteTransaction(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseExecuteTransactionParams,
    DAOMutations.ExecuteTransaction
  >(
    async (params: UseExecuteTransactionParams) => {
      const { safeId, msgValue, hexStringData, operation, nonce } = params;
      return DexService.sendExecuteMultiSigTransaction({ safeId, msgValue, hexStringData, operation, nonce, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Transactions]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
