import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { DAOQueries } from "@dao/hooks";
import { isNil } from "ramda";

interface UseUnLockGODTokenParams {
  tokenAmount: number;
  tokenHolderAddress: string;
}

export function useUnlockGODToken(
  accountId: string | undefined,
  tokenHolderAddress: string | undefined,
  tokenDecimals: string = "0",
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
      return DexService.sendUnLockGODTokenTransaction({ ...params, signer, tokenDecimals });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([GovernanceQueries.FetchLockGODToken, accountId, tokenHolderAddress]);
        queryClient.invalidateQueries([GovernanceQueries.FetchCanUnlockGODToken, accountId, tokenHolderAddress]);
        queryClient.invalidateQueries([DAOQueries.FetchDAOMembers, tokenHolderAddress]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
