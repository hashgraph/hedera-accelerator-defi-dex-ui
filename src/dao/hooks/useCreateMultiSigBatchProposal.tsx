import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { HandleOnSuccess, useDexContext } from "@dex/hooks";
import DAOService from "@dao/services";
import { isNil } from "ramda";

export interface UseCreateMultiSigBatchProposalParams {
  multiSigDAOContractId: string;
  targets: string[];
  values: number[];
  calldatas: string[];
  title: string;
  description: string;
  linkToDiscussion?: string;
}

export function useCreateMultiSigBatchProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigBatchProposalParams,
    DAOMutations.CreateMultiSigProposal
  >(
    async (params: UseCreateMultiSigBatchProposalParams) => {
      return await DAOService.sendProposeBatchTransaction({ ...params, signer });
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
