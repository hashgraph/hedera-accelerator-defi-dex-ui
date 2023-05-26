import { useMutation, useQueryClient } from "react-query";
import { DAOMutations, DAOQueries, HandleOnSuccess, useDexContext } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@services";
import { isNil } from "ramda";

interface UseApproveTransactionParams {
  safeId: string;
  transactionHash: string;
}

export function useApproveTransaction(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseApproveTransactionParams,
    DAOMutations.ApproveTransaction
  >(
    async (params: UseApproveTransactionParams) => {
      const { safeId, transactionHash } = params;
      return DexService.sendApproveMultiSigTransaction(safeId, transactionHash, signer);
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
