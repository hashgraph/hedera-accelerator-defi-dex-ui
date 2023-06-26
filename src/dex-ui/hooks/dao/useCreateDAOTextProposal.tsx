import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext, HandleOnSuccess } from "@hooks";
import { isNil } from "ramda";

interface UseCreateDAOTextProposalParams {
  governanceTokenId: string;
  governanceAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  daoContractId: string;
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
      return DexService.sendTextProposalTransaction({ ...params, signer });
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
