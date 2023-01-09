import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { HederaService } from "../../services";

interface UseChangeVoteParams {
  contractId: string;
  proposalId: string;
  voteType: number;
  signer: HashConnectSigner;
}

export function useChangeVote() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseChangeVoteParams, GovernanceMutations.ChangeVote>(
    (params: UseChangeVoteParams) => {
      const { contractId, proposalId, voteType, signer } = params;
      return HederaService.changeVote({ contractId, proposalId, voteType, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
        queryClient.invalidateQueries(GovernanceQueries.FetchHasVoted);
      },
    }
  );
}
