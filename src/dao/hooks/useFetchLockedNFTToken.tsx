import { DexService } from "@dex/services";
import { useQuery } from "react-query";
import { isNil, isNotNil } from "ramda";
import { DAOQueries } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { solidityAddressToAccountIdString } from "@shared/utils";

type UseFetchGODTokenQueryKey = [DAOQueries.FetchLockNFTToken, string | undefined, string | undefined];

export function useFetchLockedNFTToken(accountId: string | undefined, tokenHolderAddress: string) {
  function formatBalance(events: Map<string, any[]> | undefined) {
    if (isNil(events)) return 0;
    const amountEventArray = events.get("UpdatedAmount") ?? [];
    const accountAddress = AccountId.fromString(accountId ?? "").toSolidityAddress();
    const lockTokenDetails = amountEventArray.find(
      (item) => solidityAddressToAccountIdString(item.user) === solidityAddressToAccountIdString(accountAddress)
    );
    return isNotNil(lockTokenDetails?.idOrAmount) ? lockTokenDetails.idOrAmount : 0;
  }

  return useQuery<Map<string, any[]> | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [DAOQueries.FetchLockNFTToken, accountId, tokenHolderAddress],
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
