import { TokenMutationQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation } from "react-query";
import { DexService } from "@dex/services";
import { isNil } from "ramda";
import { HandleOnSuccess, useDexContext } from "@dex/hooks";

interface UseAssociateTokenParams {
  tokenId: string;
}

export function useAssociateToken(handleOnSuccess: HandleOnSuccess) {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  const accountId = wallet.savedPairingData?.accountIds[0] ?? "";
  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseAssociateTokenParams,
    TokenMutationQueries.AssociateToken
  >(
    async (params: UseAssociateTokenParams) => {
      const { tokenId } = params;
      return DexService.associateTokenToWallet({ tokenId, signer, accountId });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
