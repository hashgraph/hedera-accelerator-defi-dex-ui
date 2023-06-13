import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { UseMutationResult, useMutation, useQueryClient } from "react-query";
import { DexService } from "@services";
import { isNil } from "ramda";
import { HandleOnSuccess } from "@utils";

export type UseCastVoteProposalMutationResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseCastVoteParams,
  GovernanceMutations.ExecuteProposal
>;

interface UseCastVoteParams {
  contractId: string;
  proposalId: string;
  voteType: number;
  signer: HashConnectSigner;
}

export function useCastVote(id: string | undefined, handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse | undefined, Error, UseCastVoteParams, GovernanceMutations.CastVote>(
    async (params: UseCastVoteParams) => {
      if (isNil(id)) return;
      const { contractId, proposalId, voteType, signer } = params;
      return DexService.castVote({ contractId, proposalId, voteType, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "detail", id]);
        queryClient.invalidateQueries(GovernanceQueries.FetchHasVoted);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
