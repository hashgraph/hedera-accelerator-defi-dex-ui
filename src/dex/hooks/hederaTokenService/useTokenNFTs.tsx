import { useQuery } from "react-query";
import { DexService, MirrorNodeTokenNFT } from "@dex/services";
import { HTSQueries } from "./types";
import { useDexContext } from "@dex/hooks";

type UseTokenQueryKey = [HTSQueries.AccountTokenNFTs, string];

export function useTokenNFTs(tokenId: string) {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  return useQuery<MirrorNodeTokenNFT[], Error, MirrorNodeTokenNFT[], UseTokenQueryKey>(
    [HTSQueries.AccountTokenNFTs, tokenId],
    async () => {
      const accountId = wallet?.getSigner()?.getAccountId()?.toString() ?? "";
      const { nfts } = await DexService.fetchTokenNFTs(tokenId, accountId);
      return nfts;
    },
    {
      enabled: !!tokenId,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
