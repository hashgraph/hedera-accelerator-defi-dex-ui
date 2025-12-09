import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface ChangeThresholdForm {
  threshold: number;
  title: string;
  description: string;
  safeEVMAddress: string;
  multiSigDAOContractId: string;
}

export function useCreateChangeThresholdProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));

  return useMutation<
    TransactionResponse | undefined,
    Error,
    ChangeThresholdForm,
    DAOMutations.CreateChangeThresholdProposal
  >(
    async (params: ChangeThresholdForm) => {
      const signer = wallet.getSigner();
      return DexService.proposeChangeThreshold({ ...params, signer });
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
