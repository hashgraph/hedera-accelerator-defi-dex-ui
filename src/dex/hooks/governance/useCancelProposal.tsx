import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { DexService } from "../../services";
import { isNil } from "ramda";

export type UseCancelProposalResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseCancelProposalParams,
  GovernanceMutations.CancelProposal
>;
export interface UseCancelProposalParams {
  contractId: string;
  title: string;
  signer: HashConnectSigner;
}

export function useCancelProposal(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCancelProposalParams,
    GovernanceMutations.CancelProposal
  >(
    async (params: UseCancelProposalParams) => {
      if (isNil(id)) return;
      const { contractId, title, signer } = params;
      return DexService.cancelProposal({ contractId, title, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "detail", id]);
      },
    }
  );
}
