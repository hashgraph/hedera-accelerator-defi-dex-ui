import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface DeleteMemberForm {
  prevMemberAddress: string;
  memberAddress: string;
  safeEVMAddress: string;
  title: string;
  description: string;
  threshold: number;
  multiSigDAOContractId: string;
}

export function useCreateDeleteMemberProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<TransactionResponse | undefined, Error, DeleteMemberForm, DAOMutations.CreateDeleteMemberProposal>(
    async (params: DeleteMemberForm) => {
      return DexService.proposeRemoveOwnerWithThreshold({ ...params, signer });
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
