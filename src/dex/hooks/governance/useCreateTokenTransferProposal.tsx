import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { GovernanceMutations, GovernanceQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext } from "@dex/hooks";
import { isNil } from "ramda";

interface CreateTokenTransferProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: number;
  nftTokenSerialId: number;
}

export function useCreateTokenTransferProposal(
  handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    CreateTokenTransferProposalData,
    GovernanceMutations.CreateTokenTransferProposal
  >(
    async (params: CreateTokenTransferProposalData) => {
      const preciseTransferTokenAmount = wallet.getTokenAmountWithPrecision(
        params.tokenToTransfer,
        params.amountToTransfer
      );
      return DexService.sendCreateTransferTokenProposalTransaction({
        ...params,
        amountToTransfer: preciseTransferTokenAmount,
        signer,
      });
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
