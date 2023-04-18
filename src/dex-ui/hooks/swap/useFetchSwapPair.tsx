import { PairDataResponse, SwapMutations } from "./types";
import { useMutation } from "react-query";
import { DexService } from "../../services";

export interface UseSwapParams {
  tokenAAddress: string;
  tokenBAddress: string;
  tokenAQty: number;
}

export function useFetchSwapPair() {
  return useMutation<PairDataResponse | undefined, Error, UseSwapParams, SwapMutations.GetSwapPair>(
    (params: UseSwapParams) => {
      return DexService.getBestSwapPairAvailable({ ...params });
    }
  );
}
