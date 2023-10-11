import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { DAOType } from "@dao/services";
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
      return DexService.createTextProposal({ ...params, signer });
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
