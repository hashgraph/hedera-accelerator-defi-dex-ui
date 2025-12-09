import { DexService } from "@dex/services";
import { useQuery } from "react-query";
import { isNil, isNotNil } from "ramda";
import { DAOQueries } from "./types";

type UseFetchGODTokenQueryKey = [DAOQueries.FetchLockNFTToken, string | undefined, string | undefined];

export function useFetchLockedNFTToken(accountId: string | undefined, tokenHolderAddress: string) {
  return useQuery<number, Error, number, UseFetchGODTokenQueryKey>(
    [DAOQueries.FetchLockNFTToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return 0;

      // Fetch the actual EVM address from mirror node
      let accountEvmAddress: string;
      try {
        const accountInfo = await DexService.fetchAccountInfo(accountId);
        accountEvmAddress = accountInfo.evm_address?.toLowerCase() ?? "";
      } catch (error) {
        console.warn(`[useFetchLockedNFTToken] Could not fetch account info for ${accountId}:`, error);
        return 0;
      }

      if (!accountEvmAddress) {
        console.warn(`[useFetchLockedNFTToken] No EVM address found for ${accountId}`);
        return 0;
      }

      const events = await DexService.fetchUpgradeContractEvents(tokenHolderAddress, ["UpdatedAmount"]);
      if (isNil(events)) return 0;

      const amountEventArray = events.get("UpdatedAmount") ?? [];
      const lockTokenDetails = amountEventArray.find((item) => item.user.toLowerCase() === accountEvmAddress);
      return isNotNil(lockTokenDetails?.idOrAmount) ? lockTokenDetails.idOrAmount : 0;
    },
    {
      enabled: !!(accountId && tokenHolderAddress),
    }
  );
}
