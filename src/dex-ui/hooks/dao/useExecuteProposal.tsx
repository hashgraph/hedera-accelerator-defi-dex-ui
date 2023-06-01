import { UseMutationResult, useMutation, useQueryClient } from "react-query";
import { DAOMutations, DAOQueries, HandleOnSuccess, useDexContext } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@services";
import { isNil } from "ramda";

export type UseExecuteProposalMutationResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseExecuteProposalParams,
  DAOMutations.ExecuteProposal
>;
interface UseExecuteProposalParams {
  safeId: string;
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
}

export function useExecuteProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseExecuteProposalParams, DAOMutations.ExecuteProposal>(
    async (params: UseExecuteProposalParams) => {
      const { safeId, msgValue, hexStringData, operation, nonce } = params;
      return DexService.sendExecuteMultiSigTransaction({ safeId, msgValue, hexStringData, operation, nonce, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Proposals]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
