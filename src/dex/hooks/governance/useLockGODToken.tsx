import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService, DEX_PRECISION } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseLockGODTokenParams {
  accountId: string;
  amount: number;
  tokenHolderAddress: string;
  governanceTokenId: string;
}

export function useLockGODToken(
  tokenHolderAddress: string | undefined,
  accountId: string | undefined,
  handleOnSuccess: HandleOnSuccess
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseLockGODTokenParams, GovernanceMutations.ClaimGODToken>(
    async (params: UseLockGODTokenParams) => {
      const { amount, tokenHolderAddress, governanceTokenId } = params;
      await DexService.setTokenAllowance({
        tokenId: governanceTokenId,
        walletId: wallet.savedPairingData?.accountIds[0] ?? "",
        spenderContractId: tokenHolderAddress,
        tokenAmount: DEX_PRECISION * amount,
        signer: signer,
      });
      return DexService.sendLockGODTokenTransaction({ signer, tokenHolderAddress, tokenAmount: amount });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([GovernanceQueries.FetchLockGODToken, accountId, tokenHolderAddress]);
        queryClient.invalidateQueries([GovernanceQueries.FetchCanUnlockGODToken, accountId, tokenHolderAddress]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
