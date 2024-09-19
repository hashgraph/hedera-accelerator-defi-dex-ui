import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { useMutation, UseMutationResult, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { isNil } from "ramda";
import { Proposal } from "@dao/hooks";

export type UseCancelProposalResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseCancelProposalParams,
  GovernanceMutations.CancelProposal
>;
export interface UseCancelProposalParams {
  contractId: string;
  proposal: Proposal;
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
      return DexService.cancelProposal({ ...params });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "detail", id]);
      },
    }
  );
}
