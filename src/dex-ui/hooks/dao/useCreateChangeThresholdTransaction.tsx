import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext, HandleOnSuccess } from "@hooks";
import { isNil } from "ramda";

interface ChangeThresholdForm {
  threshold: number;
  safeAccountId: string;
  multiSigDAOContractId: string;
}

export function useCreateChangeThresholdTransaction(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    ChangeThresholdForm,
    DAOMutations.CreateChangeThresholdTransaction
  >(
    async (params: ChangeThresholdForm) => {
      return DexService.proposeChangeThreshold({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Transactions]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
