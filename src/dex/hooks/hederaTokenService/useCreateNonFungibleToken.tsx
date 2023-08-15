import { HTSMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation } from "react-query";
import { DexService } from "@dex/services";
import { useDexContext } from "../useDexContext";
import { HandleOnSuccess } from "@dex/hooks";

export interface UseCreateNFTParams {
  name: string;
  symbol: string;
  maxSupply: number;
  tokenWalletAddress: string;
  supplyKey: string;
}

export function useCreateNonFungibleToken(handleOnSuccess: HandleOnSuccess) {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse, Error, UseCreateNFTParams, HTSMutations.CreateToken>(
    (params: UseCreateNFTParams) => {
      return DexService.createNFT({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse) => {
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
