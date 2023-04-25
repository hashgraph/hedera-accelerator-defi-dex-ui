import { DexService, DEX_TOKEN_PRECISION_VALUE } from "../../services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";

type UseFetchGODTokenQueryKey = [GovernanceQueries.FetchLockGODToken, string | undefined];

export function useFetchLockedGovToken(accountId: string | undefined) {
  function formatBalance(balance: BigNumber | undefined) {
    return balance?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber() ?? 0;
  }

  return useQuery<BigNumber | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [GovernanceQueries.FetchLockGODToken, accountId],
    async () => {
      if (isNil(accountId)) return;
      return DexService.fetchLockedGODTokens(accountId);
    },
    {
      enabled: !!accountId,
      select: formatBalance,
    }
  );
}
