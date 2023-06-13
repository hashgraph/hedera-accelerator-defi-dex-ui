import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext, HandleOnSuccess } from "@hooks";
import { isNil } from "ramda";

interface UseCreateDAOTokenTransferProposalParams {
  tokenId: string;
  governanceAddress: string;
  governanceTokenId: string;
  receiverId: string;
  linkToDiscussion: string;
  amount: number;
  decimals: number;
  daoContractId: string;
  title: string;
  description: string;
}

export function useCreateDAOTokenTransferProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateDAOTokenTransferProposalParams,
    DAOMutations.CreateTokenTransferProposal
  >(
    async (params: UseCreateDAOTokenTransferProposalParams) => {
      const {
        tokenId,
        receiverId,
        amount,
        decimals,
        daoContractId,
        title,
        description,
        linkToDiscussion,
        governanceAddress,
        governanceTokenId,
      } = params;
      return DexService.sendProposeTokenTransferTransaction({
        tokenId,
        receiverId,
        amount,
        decimals,
        daoContractId,
        linkToDiscussion,
        governanceAddress,
        governanceTokenId,
        title,
        description,
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
