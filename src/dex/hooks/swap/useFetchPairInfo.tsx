import { PairInfoResponse, SwapQueries } from "./types";
import { useQuery } from "react-query";
import { DexService } from "../../services";

type UseSwapQueryKey = [SwapQueries.GetPairInfo, "getPairInfo", string | undefined];

export function useFetchPairInfo(pairId: string | undefined) {
  return useQuery<PairInfoResponse | undefined, Error, PairInfoResponse, UseSwapQueryKey>(
    [SwapQueries.GetPairInfo, "getPairInfo", pairId],
    async () => {
      if (!pairId) return;
      return DexService.getPairInfo(pairId);
    },
    {
      enabled: !!pairId,
      refetchInterval: 200000,
    }
  );
}
