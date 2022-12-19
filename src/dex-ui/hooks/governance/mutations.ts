import { Queries } from "./queries";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { HederaService } from "../../services";

export enum Mutations {
  CastVote = "castVote",
  ExecuteProposal = "executeProposal",
}

interface UseCastVoteParams {
  contractId: string;
  proposalId: string;
  voteType: number;
  signer: HashConnectSigner;
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseCastVoteParams, Mutations.CastVote>(
    (params: UseCastVoteParams) => {
      const { contractId, proposalId, voteType, signer } = params;
      return HederaService.castVote({ contractId, proposalId, voteType, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(Queries.FetchAllProposals);
        queryClient.invalidateQueries(Queries.FetchHasVoted);
      },
    }
  );
}

interface UseExecuteProposalParams {
  contractId: string;
  title: string;
  signer: HashConnectSigner;
}

export function useExecuteProposal() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseExecuteProposalParams, Mutations.ExecuteProposal>(
    (params: UseExecuteProposalParams) => {
      const { contractId, title, signer } = params;
      return HederaService.executeProposal({ contractId, title, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(Queries.FetchAllProposals);
      },
    }
  );
}
