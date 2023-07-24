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
  safeAccountId: string;
  to: string;
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
      return DexService.sendExecuteMultiSigTransaction({ ...params, signer });
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
