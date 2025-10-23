import { DEX_TOKEN_PRECISION_VALUE, DexService } from "@dex/services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { solidityAddressToAccountIdString } from "@shared/utils";

type UseFetchGODTokenQueryKey = [GovernanceQueries.FetchLockGODToken, string | undefined, string | undefined];

export function useFetchLockedGovToken(
  accountId: string | undefined,
  tokenHolderAddress: string,
  tokenPrecision?: number
) {
  function formatBalance(events: Map<string, any[]> | undefined) {
    if (isNil(events)) return 0;
    const amountEventArray = events.get("UpdatedAmount") ?? [];
    const accountAddress = AccountId.fromString(accountId ?? "").toSolidityAddress();
    const lockTokenTotalAmount = amountEventArray
      .filter(
        (item) => solidityAddressToAccountIdString(item.user) === solidityAddressToAccountIdString(accountAddress)
      )
      .reduce((total, item) => {
        return total.plus(new BigNumber(item.idOrAmount).shiftedBy(tokenPrecision ?? DEX_TOKEN_PRECISION_VALUE));
      }, new BigNumber(0));

    return (lockTokenTotalAmount || new BigNumber(0)).toNumber();
  }

  return useQuery<Map<string, any[]> | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [GovernanceQueries.FetchLockGODToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return;
      return DexService.fetchUpgradeContractEvents(tokenHolderAddress, ["UpdatedAmount"]);
    },
    {
      enabled: !!accountId && !!tokenHolderAddress,
      select: formatBalance,
    }
  );
}
