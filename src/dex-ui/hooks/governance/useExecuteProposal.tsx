import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { HederaService } from "../../services";

interface UseExecuteProposalParams {
  contractId: string;
  title: string;
  signer: HashConnectSigner;
}

export function useExecuteProposal() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseExecuteProposalParams, GovernanceMutations.ExecuteProposal>(
    (params: UseExecuteProposalParams) => {
      const { contractId, title, signer } = params;
      return HederaService.executeProposal({ contractId, title, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
      },
    }
  );
}
