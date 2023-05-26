import { HTSMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation } from "react-query";
import { DexService } from "../../services";
import { useDexContext } from "../useDexContext";

export interface UseCreateNFTParams {
  name: string;
  symbol: string;
  maxSupply: number;
  tokenWalletAddress: string;
  supplyKey: string;
}

export function useCreateNonFungibleToken(handleCreateTokenSuccessful: () => void) {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse, Error, UseCreateNFTParams, HTSMutations.CreateToken>(
    (params: UseCreateNFTParams) => {
      return DexService.createNFT({ ...params, signer });
    },
    {
      onSuccess: () => {
        handleCreateTokenSuccessful();
      },
    }
  );
}
