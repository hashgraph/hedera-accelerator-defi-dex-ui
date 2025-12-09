import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateMultiSigDAOUpgradeProposalParams {
  multiSigDAOContractId: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  newImplementationAddress: string;
  oldProxyAddress: string;
}

export function useCreateMultiSigDAOUpgradeProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigDAOUpgradeProposalParams,
    DAOMutations.CreateMultiSigDAOUpgradeProposal
  >(
    async (params: UseCreateMultiSigDAOUpgradeProposalParams) => {
      const signer = wallet.getSigner();
      return DexService.proposeMultiSigDAOUpgradeProposal({ ...params, signer });
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
