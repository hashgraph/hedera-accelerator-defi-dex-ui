import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import { DAOType } from "@dao/services";

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
  nftTokenSerialId: number;
  daoType: DAOType;
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
        nftTokenSerialId,
        daoType,
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
        nftTokenSerialId,
        signer,
        daoType,
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
