import { UseMutationResult, useMutation, useQueryClient } from "react-query";
import { DAOMutations, DAOQueries, HandleOnSuccess, useDexContext } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@services";
import { isNil } from "ramda";

export type UseApproveProposalMutationResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseApproveProposalParams,
  DAOMutations.ApproveProposal
>;

interface UseApproveProposalParams {
  safeId: string;
  transactionHash: string;
}

export function useApproveProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseApproveProposalParams, DAOMutations.ApproveProposal>(
    async (params: UseApproveProposalParams) => {
      const { safeId, transactionHash } = params;
      return DexService.sendApproveMultiSigTransaction(safeId, transactionHash, signer);
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
