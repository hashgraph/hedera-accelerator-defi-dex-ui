import { DexService } from "@dex/services";
import { useQuery } from "@tanstack/react-query";
import { isNil } from "ramda";
import { DAOQueries } from "./types";

type UseFetchGODTokenQueryKey = [DAOQueries.FetchLockNFTToken, string | undefined, string | undefined];

export function useFetchLockedNFTToken(accountId: string | undefined, tokenHolderAddress: string) {
  return useQuery<number | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [DAOQueries.FetchLockNFTToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return;
      return DexService.fetchUpgradeContractEvents(tokenHolderAddress, accountId);
    },
    {
      enabled: !!(accountId && tokenHolderAddress),
    }
  );
}
