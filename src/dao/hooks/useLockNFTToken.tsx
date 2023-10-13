import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import { DAOMutations, DAOQueries } from "./types";
import DAOService from "@dao/services/contracts";
import { DexService } from "@dex/services";

interface UseLockNFTTokenParams {
  tokenId: string;
  nftSerialId: number;
  spenderContractId: string;
}

export function useLockNFTToken(
  tokenHolderAddress: string | undefined,
  accountId: string | undefined,
  handleOnSuccess: HandleOnSuccess
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseLockNFTTokenParams, DAOMutations.LockNFTToken>(
    async (params: UseLockNFTTokenParams) => {
      const { nftSerialId, spenderContractId, tokenId } = params;
      await DexService.setNFTAllowance({
        tokenId,
        nftSerialId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        signer,
      });
      return DAOService.sendLockNFTTokenTransaction({ nftSerialId, spenderContractId, signer });
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
