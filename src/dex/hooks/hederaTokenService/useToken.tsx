import { useQuery } from "react-query";
import { DexService, MirrorNodeTokenById } from "@dex/services";
import { HTSQueries } from "./types";

type UseTokenQueryKey = [HTSQueries.Token, string];

export function useToken(tokenId: string) {
  return useQuery<MirrorNodeTokenById, Error, MirrorNodeTokenById, UseTokenQueryKey>(
    [HTSQueries.Token, tokenId],
    async () => {
      return DexService.fetchTokenData(tokenId);
    },
    {
      enabled: !!tokenId,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
