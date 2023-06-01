import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { HandleOnSuccess, useDexContext } from "@hooks";
import { isNil } from "ramda";

interface AddMemberForm {
  newMemberAddress: string;
  safeAccountId: string;
  threshold: number;
  multiSigDAOContractId: string;
}

export function useCreateAddMemberProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<TransactionResponse | undefined, Error, AddMemberForm, DAOMutations.CreateAddMemberProposal>(
    async (params: AddMemberForm) => {
      return DexService.proposeAddOwnerWithThreshold({ ...params, signer });
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
