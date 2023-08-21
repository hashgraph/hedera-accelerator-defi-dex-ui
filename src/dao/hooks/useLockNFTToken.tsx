import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import { DAOMutations, DAOQueries } from "./types";
import DAOService from "@dao/services/contracts";
import { DexService } from "@dex/services";

interface UseLockGODTokenParams {
  nftTokenSerialId: number;
  tokenHolderAddress: string;
  governanceTokenId: string;
}

export function useLockNFTToken(
  tokenHolderAddress: string | undefined,
  accountId: string | undefined,
  handleOnSuccess: HandleOnSuccess
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseLockGODTokenParams, DAOMutations.LockNFTToken>(
    async (params: UseLockGODTokenParams) => {
      const { nftTokenSerialId, tokenHolderAddress, governanceTokenId } = params;
      await DexService.setNFTAllowance({
        nftId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId: tokenHolderAddress,
        signer,
      });
      return DAOService.sendLockNFTTokenTransaction({ nftTokenSerialId, tokenHolderAddress, signer });
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
