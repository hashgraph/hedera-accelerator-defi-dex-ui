import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext, HandleOnSuccess } from "@hooks";
import { isNil } from "ramda";

interface UseCreateMultiSigProposalParams {
  tokenId: string;
  receiverId: string;
  amount: number;
  decimals: number;
  multiSigDAOContractId: string;
  safeId: string;
}

export function useCreateMultiSigProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigProposalParams,
    DAOMutations.CreateMultiSigProposal
  >(
    async (params: UseCreateMultiSigProposalParams) => {
      const { tokenId, safeId, receiverId, amount, decimals, multiSigDAOContractId } = params;
      return DexService.sendProposeTransferTransaction({
        tokenId,
        receiverId,
        amount,
        decimals,
        multiSigDAOContractId,
        safeId,
        signer,
      });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Proposals]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
