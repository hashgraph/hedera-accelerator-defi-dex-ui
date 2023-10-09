import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { DAOType, TokenType } from "@dao/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateDAOTextProposalParams {
  governanceTokenId: string;
  governorContractId: string;
  assetHolderEVMAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  metadata: string;
  daoContractId: string;
  nftTokenSerialId: number;
  daoType: DAOType;
}

export function useCreateDAOTextProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateDAOTextProposalParams,
    DAOMutations.CreateDAOTextProposal
  >(
    async (params: UseCreateDAOTextProposalParams) => {
      const {
        title,
        description,
        linkToDiscussion,
        metadata,
        nftTokenSerialId,
        assetHolderEVMAddress,
        governorContractId,
        governanceTokenId,
        daoType,
      } = params;
      await DexService.setUpAllowance({
        governanceTokenId,
        tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
        spenderContractId: governorContractId,
        signer,
      });
      return DexService.createTextProposal({
        title,
        description,
        linkToDiscussion,
        metadata,
        nftTokenSerialId,
        assetHolderEVMAddress,
        governorContractId,
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
