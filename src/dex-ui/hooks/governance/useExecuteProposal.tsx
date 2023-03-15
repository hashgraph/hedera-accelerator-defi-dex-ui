import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { isNil } from "ramda";

interface UseExecuteProposalParams {
  contractId: string;
  title: string;
  signer: HashConnectSigner;
}

export function useExecuteProposal(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseExecuteProposalParams,
    GovernanceMutations.ExecuteProposal
  >(
    async (params: UseExecuteProposalParams) => {
      if (isNil(id)) return;
      const { contractId, title, signer } = params;
      return DexService.executeProposal({ contractId, title, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "detail", id]);
      },
    }
  );
}
