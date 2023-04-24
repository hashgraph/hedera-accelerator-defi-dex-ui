import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { useDexContext } from "../useDexContext";

interface UseUnLockGODTokenParams {
  tokenAmount: number;
}

export function useUnlockGODToken(accountId: string | undefined) {
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
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.FetchLockGODToken, accountId]);
        queryClient.invalidateQueries([GovernanceQueries.FetchCanUnlockGODToken, accountId]);
      },
    }
  );
}
