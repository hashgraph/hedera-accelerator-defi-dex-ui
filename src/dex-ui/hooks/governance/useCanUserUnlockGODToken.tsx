import { DexService } from "@services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";

type UseFetchCanUnlockGODTokenQueryKey = [
  GovernanceQueries.FetchCanUnlockGODToken,
  string | undefined,
  string | undefined
];

export function useCanUserUnlockGODToken(accountId: string | undefined, tokenHolderAddress: string) {
  return useQuery<boolean, Error, boolean, UseFetchCanUnlockGODTokenQueryKey>(
    [GovernanceQueries.FetchCanUnlockGODToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return false;
      return DexService.fetchCanUserUnlockGODToken(tokenHolderAddress);
    },
    {
      enabled: !!(accountId && tokenHolderAddress),
    }
  );
}
