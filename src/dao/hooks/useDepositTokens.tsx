import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseDepositTokensParams {
  safeId: string;
  tokenId: string;
  amount: number;
  decimals: number;
  isNFT: boolean;
  nftSerialId: number;
}

export function useDepositTokens(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<TransactionResponse | undefined, Error, UseDepositTokensParams, DAOMutations.DepositTokens>(
    async (params: UseDepositTokensParams) => {
      return DexService.sendTokensTransaction({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
