import { UseMutationResult, useMutation, useQueryClient } from "react-query";
import { HandleOnSuccess, useDexContext } from "@dex/hooks";
import { DAOMutations, DAOQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@dex/services";
import { isNil } from "ramda";

export type UseChangeAdminMutationResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseChangeAdminParams,
  DAOMutations.ChangeAdmin
>;

interface UseChangeAdminParams {
  safeAccountId: string;
  proxyAddress: string;
}

export function useChangeAdmin(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  return useMutation<TransactionResponse | undefined, Error, UseChangeAdminParams, DAOMutations.ChangeAdmin>(
    async (params: UseChangeAdminParams) => {
      const { safeAccountId, proxyAddress } = params;
      const signer = wallet.getSigner();
      return DexService.sendChangeAdminForProposalTransaction(safeAccountId, proxyAddress, signer);
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
