import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext } from "@hooks";
import { isNil } from "ramda";

interface DeleteMemberForm {
  memberAddress: string;
  safeAccountId: string;
  threshold: number;
  multiSigDAOContractId: string;
}

export function useCreateDeleteMemberTransaction(
  handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    DeleteMemberForm,
    DAOMutations.CreateDeleteMemberTransaction
  >(
    async (params: DeleteMemberForm) => {
      return DexService.proposeRemoveOwnerWithThreshold({ ...params, signer });
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
