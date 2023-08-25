import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { GovernanceMutations, GovernanceQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext } from "@dex/hooks";
import { isNil } from "ramda";

interface CreateTextProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
  nftTokenSerialId: number;
}

export function useCreateTextProposal(handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    CreateTextProposalData,
    GovernanceMutations.CreateTextProposal
  >(
    async (params: CreateTextProposalData) => {
      return DexService.sendCreateTextProposalTransaction({ ...params, signer });
    },
    {
      onSuccess: (data: TransactionResponse | undefined) => {
        if (isNil(data)) return;
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        handleSendProposesSuccess(data);
      },
    }
  );
}
