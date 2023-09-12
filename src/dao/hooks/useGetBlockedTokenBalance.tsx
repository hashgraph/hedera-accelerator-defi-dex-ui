import { useQuery } from "react-query";
import { DexService } from "@dex/services";
import { TokenType } from "@dao/services";
import { DAOQueries, GovernanceEvent, BlockedNFTEvent } from "./types";
import { isNil, isNotNil } from "ramda";
import BigNumber from "bignumber.js";

type UseGetBlockBalanceKey = [DAOQueries.FetchBlockedTokenBalance, string, string];

export function useGetBlockedTokenBalance(governorEVMAddress: string, govTokenId: string) {
  async function getBlockedNFTSerialIds(governorEVMAddress: string) {
    const events = await DexService.fetchUpgradeContractEvents(governorEVMAddress, [
      GovernanceEvent.NFTSerialIdBlockStatus,
    ]);
    if (isNil(events)) return [];
    const blockedNFTEventArray = events.get(GovernanceEvent.NFTSerialIdBlockStatus) ?? [];
    const uniqueNftsLogs: BlockedNFTEvent[] = [];
    blockedNFTEventArray
      .slice()
      .reverse()
      .forEach((log: BlockedNFTEvent) => {
        const lockedNftIndex = uniqueNftsLogs.findIndex((obj) => obj.nftSerialId === log.nftSerialId);
        if (lockedNftIndex === -1) {
          uniqueNftsLogs.push(log);
        } else {
          uniqueNftsLogs[lockedNftIndex] = { ...log };
        }
      });
    const blockedNFTs = uniqueNftsLogs.filter((log) => log.isBlocked).map((nft) => nft.nftSerialId);
    return blockedNFTs;
  }

  async function getBlockedFungibleTokens(governorEVMAddress: string, decimals: string) {
    const events = await DexService.fetchUpgradeContractEvents(governorEVMAddress, [GovernanceEvent.GovernorBalance]);
    if (isNil(events)) return 0;
    const blockedAmountEventArray = events.get(GovernanceEvent.GovernorBalance) ?? [];
    const blockedTokenDetails = isNotNil(blockedAmountEventArray[0]) ? blockedAmountEventArray[0] : undefined;
    return isNotNil(blockedTokenDetails)
      ? BigNumber(blockedTokenDetails.blockedGodTokenBalance).shiftedBy(-decimals).toNumber() ?? 0
      : 0;
  }

  return useQuery<number | number[], Error, number | number[], UseGetBlockBalanceKey>(
    [DAOQueries.FetchBlockedTokenBalance, governorEVMAddress, govTokenId],
    async () => {
      const { data: tokenData } = await DexService.fetchTokenData(govTokenId);
      return tokenData.type === TokenType.FungibleToken
        ? getBlockedFungibleTokens(governorEVMAddress, tokenData.decimals)
        : getBlockedNFTSerialIds(governorEVMAddress);
    },
    {
      enabled: !!(governorEVMAddress && govTokenId),
      staleTime: 5,
    }
  );
}
