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
  title: string;
  description: string;
  tokenType: string;
  nftSerialId: number;
  governanceNftTokenSerialId: number;
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
        title,
        description,
        linkToDiscussion,
        governanceAddress,
        governanceTokenId,
        tokenType,
        nftSerialId,
        governanceNftTokenSerialId,
        daoType,
      } = params;
      return DexService.sendProposeTokenTransferTransaction({
        tokenId,
        receiverId,
        amount,
        decimals,
        linkToDiscussion,
        governanceAddress,
        governanceTokenId,
        title,
        description,
        tokenType,
        nftSerialId,
        governanceNftTokenSerialId,
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
