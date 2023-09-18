import { DexService, DEX_TOKEN_PRECISION_VALUE } from "@dex/services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil, isNotNil } from "ramda";
import BigNumber from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { solidityAddressToAccountIdString } from "@shared/utils";

type UseFetchGODTokenQueryKey = [GovernanceQueries.FetchLockGODToken, string | undefined, string | undefined];

export function useFetchLockedGovToken(accountId: string | undefined, tokenHolderAddress: string) {
  function formatBalance(events: Map<string, any[]> | undefined) {
    if (isNil(events)) return 0;
    const amountEventArray = events.get("UpdatedAmount") ?? [];
    const accountAddress = AccountId.fromString(accountId ?? "").toSolidityAddress();
    const lockTokenDetails = amountEventArray.find(
      (item) => solidityAddressToAccountIdString(item.user) === solidityAddressToAccountIdString(accountAddress)
    );
    return isNotNil(lockTokenDetails?.idOrAmount)
      ? BigNumber(lockTokenDetails.idOrAmount).shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber()
      : 0;
  }

  return useQuery<Map<string, any[]> | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [GovernanceQueries.FetchLockGODToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return;
      return DexService.fetchUpgradeContractEvents(tokenHolderAddress, ["UpdatedAmount"]);
    },
    {
      enabled: !!(accountId && tokenHolderAddress),
      select: formatBalance,
    }
  );
}
