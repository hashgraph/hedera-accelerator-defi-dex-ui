import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import { DAOType } from "@dao/services";

interface UseCreateGOVTokenAssociateProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  tokenId: string;
  governanceTokenId: string;
  governorContractId: string;
  assetHolderEVMAddress: string;
  nftTokenSerialId: number;
  daoType: DAOType;
}

export function useCreateGOVTokenAssociateProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateGOVTokenAssociateProposalParams,
    DAOMutations.CreateGOVTokenAssociateProposal
  >(
    async (params: UseCreateGOVTokenAssociateProposalParams) => {
      return DexService.createGOVTokenAssociateProposal({ ...params, signer });
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
