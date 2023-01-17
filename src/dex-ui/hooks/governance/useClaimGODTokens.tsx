import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";

interface UseClaimGODTokensParams {
  contractId: string;
  proposalId: string;
  signer: HashConnectSigner;
}
/**
 * @privateRemarks
 *
 * This hook is not currently in use. However, it will most likely be needed
 * for upcoming governance token claiming features.
 * */
export function useClaimGODTokens() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseClaimGODTokensParams, GovernanceMutations.ClaimGODToken>(
    (params: UseClaimGODTokensParams) => {
      const { contractId, proposalId, signer } = params;
      return DexService.sendClaimGODTokenTransaction({ contractId, proposalId, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
      },
    }
  );
}
