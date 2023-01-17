import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, UseMutationResult, useQueryClient } from "react-query";
import { DexService } from "../../services";

export type UseCancelProposalResult = UseMutationResult<
  TransactionResponse,
  Error,
  UseCancelProposalParams,
  GovernanceMutations.CancelProposal
>;
interface UseCancelProposalParams {
  contractId: string;
  title: string;
  signer: HashConnectSigner;
}

export function useCancelProposal() {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, UseCancelProposalParams, GovernanceMutations.CancelProposal>(
    (params: UseCancelProposalParams) => {
      const { contractId, title, signer } = params;
      return DexService.cancelProposal({ contractId, title, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
      },
    }
  );
}
