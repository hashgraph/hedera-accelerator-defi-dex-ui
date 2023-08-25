import { DexService } from "@dex/services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";

type UseFetchCanUnlockGODTokenQueryKey = [
  GovernanceQueries.FetchCanUnlockGODToken,
  string | undefined,
  string | undefined
];

export function useCanUserUnlockGODToken(accountId: string | undefined, tokenHolderAddress: string) {
  return useQuery<boolean | undefined, Error, boolean | undefined, UseFetchCanUnlockGODTokenQueryKey>(
    [GovernanceQueries.FetchCanUnlockGODToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return false;
      return DexService.fetchCanUserClaimGODTokens(tokenHolderAddress, accountId);
    },
    {
      enabled: !!(accountId && tokenHolderAddress),
    }
  );
}
