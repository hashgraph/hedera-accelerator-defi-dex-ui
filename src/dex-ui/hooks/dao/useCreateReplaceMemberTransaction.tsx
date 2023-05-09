import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext } from "@hooks";
import { isNil } from "ramda";

interface ReplaceMemberForm {
  newMemberAddress: string;
  oldMemberAddress: string;
  safeAccountId: string;
  multiSigDAOContractId: string;
}

export function useCreateReplaceMemberTransaction(
  handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    ReplaceMemberForm,
    DAOMutations.CreateReplaceMemberTransaction
  >(
    async (params: ReplaceMemberForm) => {
      return DexService.proposeSwapOwnerWithThreshold({ ...params, signer });
    },
    {
      onSuccess: (data: TransactionResponse | undefined) => {
        if (isNil(data)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Transactions]);
        handleSendProposesSuccess(data);
      },
    }
  );
}
