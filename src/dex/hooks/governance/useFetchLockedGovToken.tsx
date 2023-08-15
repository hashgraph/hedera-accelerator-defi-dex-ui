import { DexService, DEX_TOKEN_PRECISION_VALUE } from "@dex/services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";

type UseFetchGODTokenQueryKey = [GovernanceQueries.FetchLockGODToken, string | undefined, string | undefined];

export function useFetchLockedGovToken(accountId: string | undefined, tokenHolderAddress: string) {
  function formatBalance(balance: number | undefined) {
    return balance ? BigNumber(balance).shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber() : 0;
  }

  return useQuery<number | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [GovernanceQueries.FetchLockGODToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return;
      return DexService.fetchUpgradeContractEvents(tokenHolderAddress, accountId);
    },
    {
      enabled: !!(accountId && tokenHolderAddress),
      select: formatBalance,
    }
  );
}
