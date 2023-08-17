import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateDAOTokenTransferProposalParams {
  tokenId: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  daoAccountId: string;
}

export function useCreateDAOTokenAssociateProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateDAOTokenTransferProposalParams,
    DAOMutations.CreateTokenAssociateProposal
  >(
    async (params: UseCreateDAOTokenTransferProposalParams) => {
      return DexService.sendDAOTokenAssociateTransaction({ ...params, signer });
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
