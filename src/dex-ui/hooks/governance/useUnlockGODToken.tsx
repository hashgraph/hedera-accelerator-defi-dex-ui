import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "@services";
import { useDexContext, HandleOnSuccess } from "@hooks";
import { isNil } from "ramda";

interface UseUnLockGODTokenParams {
  tokenAmount: number;
  tokenHolderAddress: string;
}

export function useUnlockGODToken(
  accountId: string | undefined,
  tokenHolderAddress: string | undefined,
  handleOnSuccess: HandleOnSuccess
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseUnLockGODTokenParams,
    GovernanceMutations.ClaimGODToken
  >(
    async (params: UseUnLockGODTokenParams) => {
      return DexService.sendUnLockGODTokenTransaction({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([GovernanceQueries.FetchLockGODToken, tokenHolderAddress, accountId]);
        queryClient.invalidateQueries([GovernanceQueries.FetchCanUnlockGODToken, tokenHolderAddress, accountId]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
