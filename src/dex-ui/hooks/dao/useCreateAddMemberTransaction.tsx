import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext } from "@hooks";
import { isNil } from "ramda";

interface AddMemberForm {
  newMemberAddress: string;
  safeAccountId: string;
  threshold: number;
  multiSigDAOContractId: string;
}

export function useCreateAddMemberTransaction(
  handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<TransactionResponse | undefined, Error, AddMemberForm, DAOMutations.CreateAddMemberTransaction>(
    async (params: AddMemberForm) => {
      return DexService.proposeAddOwnerWithThreshold({ ...params, signer });
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
