import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { useDexContext } from "../useDexContext";

interface UseLockGODTokenParams {
  accountId: string;
  amount: number;
}

export function useLockGODToken(accountId: string | undefined) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseLockGODTokenParams, GovernanceMutations.ClaimGODToken>(
    async (params: UseLockGODTokenParams) => {
      const { accountId, amount } = params;
      return DexService.sendLockGODTokenTransaction({ accountId, tokenAmount: amount, signer });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.FetchLockGODToken, accountId]);
        queryClient.invalidateQueries([GovernanceQueries.FetchCanUnlockGODToken, accountId]);
      },
    }
  );
}
