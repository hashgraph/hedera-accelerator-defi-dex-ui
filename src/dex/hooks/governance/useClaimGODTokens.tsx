import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { isNil } from "ramda";

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
export function useClaimGODTokens(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseClaimGODTokensParams,
    GovernanceMutations.ClaimGODToken
  >(
    async (params: UseClaimGODTokensParams) => {
      if (isNil(id)) return;
      const { contractId, proposalId, signer } = params;
      return DexService.sendClaimGODTokenTransaction({ contractId, proposalId, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "detail", id]);
      },
    }
  );
}
