import { DAOMutations, DAOQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import DAOService from "@dao/services/contracts";

interface UseUnLockNFTTokenParams {
  tokenHolderAddress: string;
}

export function useUnlockNFTToken(
  accountId: string | undefined,
  tokenHolderAddress: string | undefined,
  handleOnSuccess: HandleOnSuccess
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseUnLockNFTTokenParams, DAOMutations.UnlockNFTToken>(
    async (params: UseUnLockNFTTokenParams) => {
      return DAOService.sendUnLockNFTTokenTransaction({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.FetchLockNFTToken, accountId, tokenHolderAddress]);
        queryClient.invalidateQueries([DAOQueries.FetchCanUnlockNFTToken, accountId, tokenHolderAddress]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
