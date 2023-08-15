import { HTSMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation } from "react-query";
import { DexService } from "@dex/services";
import { useDexContext } from "../useDexContext";
import { HandleOnSuccess } from "@dex/hooks";

export interface UseCreateTokenParams {
  name: string;
  symbol: string;
  initialSupply: number;
  decimals: number;
  supplyKey: string;
  tokenWalletAddress: string;
}

export function useCreateToken(handleOnSuccess: HandleOnSuccess) {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse, Error, UseCreateTokenParams, HTSMutations.CreateToken>(
    (params: UseCreateTokenParams) => {
      return DexService.createToken({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse) => {
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
