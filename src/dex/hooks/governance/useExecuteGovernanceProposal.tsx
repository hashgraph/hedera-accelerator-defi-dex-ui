import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { isNil } from "ramda";
import { HandleOnSuccess } from "..";
import { Proposal } from "@dao/hooks";

export interface UseExecuteProposalParams {
  contractId: string;
  proposal: Proposal;
  signer: HashConnectSigner;
  transfersFromAccount?: string;
  tokenId?: string;
  tokenAmount?: number;
}

export function useExecuteGovernanceProposal(id: string | undefined, handleOnSuccess?: HandleOnSuccess) {
  const queryClient = useQueryClient();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseExecuteProposalParams,
    GovernanceMutations.ExecuteProposal
  >(
    async (params: UseExecuteProposalParams) => {
      if (isNil(id)) return;
      return DexService.executeProposal({ ...params });
    },
    {
      onSuccess: (transactionResponse) => {
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "detail", id]);
        if (handleOnSuccess && transactionResponse) {
          handleOnSuccess(transactionResponse);
        }
      },
    }
  );
}
