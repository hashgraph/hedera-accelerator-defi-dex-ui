import { UseMutationResult, useMutation, useQueryClient } from "react-query";
import { HandleOnSuccess, useDexContext } from "@dex/hooks";
import { DAOMutations, DAOQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { DexService } from "@dex/services";
import { isNil } from "ramda";

export type UseTransferOwnershipMutationResult = UseMutationResult<
  TransactionResponse | undefined,
  Error,
  UseTransferOwnershipParams,
  DAOMutations.TransferOwnership
>;

interface UseTransferOwnershipParams {
  newOwnerEVMAddress: string;
  targetAddress: string;
}

export function useTransferOwnership(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseTransferOwnershipParams,
    DAOMutations.TransferOwnership
  >(
    async (params: UseTransferOwnershipParams) => {
      const { newOwnerEVMAddress, targetAddress } = params;
      return DexService.sendTransferOwnershipTransaction({ newOwnerEVMAddress, targetAddress, signer });
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
