import { HTSMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation } from "react-query";
import { DexService } from "../../services";
import { useDexContext } from "../useDexContext";

export interface UseCreateTokenParams {
  name: string;
  symbol: string;
  initialSupply: number;
  decimals: number;
  treasuryAccountId: string;
}

export function useCreateToken(handleCreateTokenSuccessful: () => void) {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse, Error, UseCreateTokenParams, HTSMutations.CreateToken>(
    (params: UseCreateTokenParams) => {
      return DexService.createToken({ ...params, signer });
    },
    {
      onSuccess: () => {
        handleCreateTokenSuccessful();
      },
    }
  );
}
