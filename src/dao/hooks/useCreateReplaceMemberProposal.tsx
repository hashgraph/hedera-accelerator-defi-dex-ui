import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface ReplaceMemberForm {
  prevMemberAddress: string;
  newMemberAddress: string;
  title: string;
  description: string;
  oldMemberAddress: string;
  safeEVMAddress: string;
  multiSigDAOContractId: string;
}

export function useCreateReplaceMemberProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    ReplaceMemberForm,
    DAOMutations.CreateReplaceMemberProposal
  >(
    async (params: ReplaceMemberForm) => {
      return DexService.proposeSwapOwnerWithThreshold({ ...params, signer });
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
