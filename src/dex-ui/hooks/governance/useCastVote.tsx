import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { HederaService } from "../../services";

interface UseCastVoteParams {
  contractId: string;
  proposalId: string;
  voteType: number;
  signer: HashConnectSigner;
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseCastVoteParams, GovernanceMutations.CastVote>(
    (params: UseCastVoteParams) => {
      const { contractId, proposalId, voteType, signer } = params;
      return HederaService.castVote({ contractId, proposalId, voteType, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
        queryClient.invalidateQueries(GovernanceQueries.FetchHasVoted);
      },
    }
  );
}
