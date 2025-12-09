import { DEX_TOKEN_PRECISION_VALUE, DexService } from "@dex/services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";

type UseFetchGODTokenQueryKey = [GovernanceQueries.FetchLockGODToken, string | undefined, string | undefined];

export function useFetchLockedGovToken(
  accountId: string | undefined,
  tokenHolderAddress: string,
  tokenPrecision?: number
) {
  return useQuery<number, Error, number, UseFetchGODTokenQueryKey>(
    [GovernanceQueries.FetchLockGODToken, accountId, tokenHolderAddress],
    async () => {
      if (isNil(accountId)) return 0;

      // Fetch the actual EVM address from mirror node
      let accountEvmAddress: string;
      try {
        const accountInfo = await DexService.fetchAccountInfo(accountId);
        accountEvmAddress = accountInfo.evm_address?.toLowerCase() ?? "";
        console.log("[useFetchLockedGovToken] Account ID:", accountId);
        console.log("[useFetchLockedGovToken] EVM Address:", accountEvmAddress);
      } catch (error) {
        console.warn(`[useFetchLockedGovToken] Could not fetch account info for ${accountId}:`, error);
        return 0;
      }

      if (!accountEvmAddress) {
        console.warn(`[useFetchLockedGovToken] No EVM address found for ${accountId}`);
        return 0;
      }

      const events = await DexService.fetchUpgradeContractEvents(tokenHolderAddress, ["UpdatedAmount"]);
      if (isNil(events)) {
        console.log("[useFetchLockedGovToken] No events found");
        return 0;
      }

      const amountEventArray = events.get("UpdatedAmount") ?? [];
      console.log("[useFetchLockedGovToken] Total UpdatedAmount events:", amountEventArray.length);
      console.log(
        "[useFetchLockedGovToken] All event users:",
        amountEventArray.map((item) => ({
          user: item.user.toLowerCase(),
          amount: item.idOrAmount,
        }))
      );

      const lockTokenTotalAmount = amountEventArray
        .filter((item) => {
          const matches = item.user.toLowerCase() === accountEvmAddress;
          if (matches) {
            console.log("[useFetchLockedGovToken] MATCH FOUND!", item.user, item.idOrAmount);
          }
          return matches;
        })
        .reduce((total, item) => {
          return total.plus(new BigNumber(item.idOrAmount).shiftedBy(-(tokenPrecision ?? DEX_TOKEN_PRECISION_VALUE)));
        }, new BigNumber(0));

      const result = (lockTokenTotalAmount || new BigNumber(0)).toNumber();
      console.log("[useFetchLockedGovToken] Final voting power:", result);
      return result;
    },
    {
      enabled: !!accountId && !!tokenHolderAddress,
    }
  );
}
