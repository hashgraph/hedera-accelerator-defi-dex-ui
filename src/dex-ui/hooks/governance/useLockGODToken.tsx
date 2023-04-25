import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { Contracts, DexService, DEX_PRECISION, GovernanceTokenId } from "../../services";
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
      await DexService.setTokenAllowance({
        tokenId: GovernanceTokenId,
        walletId: wallet.savedPairingData?.accountIds[0] ?? "",
        spenderContractId: Contracts.GODHolder.ProxyId,
        tokenAmount: DEX_PRECISION * amount,
        signer: signer,
      });
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
