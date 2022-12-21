import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { HederaService } from "../../services";

interface UseClaimGODTokensParams {
  contractId: string;
  proposalId: string;
  signer: HashConnectSigner;
}

export function useClaimGODTokens() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseClaimGODTokensParams, GovernanceMutations.ClaimGODToken>(
    (params: UseClaimGODTokensParams) => {
      const { contractId, proposalId, signer } = params;
      return HederaService.sendClaimGODTokenTransaction({ contractId, proposalId, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
      },
    }
  );
}
