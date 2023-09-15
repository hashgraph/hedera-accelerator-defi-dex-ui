import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateMultiSigTextProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  metadata: string;
  safeEVMAddress: string;
  multiSigDAOContractId: string;
}

export function useCreateMultiSigTextProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  const signerAccountId = wallet.savedPairingData?.accountIds[0] ?? "";

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigTextProposalParams,
    DAOMutations.CreateMultiSigDAOTextProposal
  >(
    async (params: UseCreateMultiSigTextProposalParams) => {
      return DexService.proposeMultiSigTextProposal({
        ...params,
        signer,
        signerAccountId,
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
