import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import { DAOType, MultiSigProposeTransactionType } from "@dao/services";
import DAOService from "@dao/services";
import { DexService } from "@dex/services";

interface UseCreateMultiSigGenericProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  functionData: string;
  targetContractId: string;
  multiSigDAOContractId: string;
  daoType: DAOType;
}

export function useCreateMultiSigGenericProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigGenericProposalParams,
    DAOMutations.CreateGOVTokenAssociateProposal
  >(
    async (params: UseCreateMultiSigGenericProposalParams) => {
      const { targetContractId, functionData, multiSigDAOContractId, title, description, linkToDiscussion } = params;
      const safeEVMAddress = await DexService.fetchContractEVMAddress(targetContractId);
      return DAOService.sendProposeTransaction({
        safeEVMAddress,
        data: functionData,
        multiSigDAOContractId,
        transactionType: MultiSigProposeTransactionType.GenericProposal,
        title,
        description,
        linkToDiscussion,
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
