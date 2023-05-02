import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext } from "@hooks";
import { isNil } from "ramda";

interface UseCreateMultiSigTransactionParams {
  tokenId: string;
  receiverId: string;
  amount: number;
  decimals: number;
  multiSigDAOContractId: string;
}

export function useCreateMultiSigTransaction(
  handleCreateDAOSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigTransactionParams,
    DAOMutations.CreateMultiSigTransaction
  >(
    async (params: UseCreateMultiSigTransactionParams) => {
      const { tokenId, receiverId, amount, decimals, multiSigDAOContractId } = params;
      return DexService.sendProposeTransferTransaction({
        tokenId,
        receiverId,
        amount,
        decimals,
        multiSigDAOContractId,
        signer,
      });
    },
    {
      onSuccess: (data: TransactionResponse | undefined) => {
        if (isNil(data)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Transactions]);
        handleCreateDAOSuccess(data);
      },
    }
  );
}
