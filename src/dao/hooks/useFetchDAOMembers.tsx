import { DexService } from "@dex/services";
import { useQuery } from "react-query";
import { isNil } from "ramda";
import { DAOQueries, UpdateAmountEventData } from "./types";
import { DAOEvents, Member } from "@dao/services";

type UseFetchDAOMembersQueryKey = [DAOQueries.FetchDAOMembers, string | undefined];

export function useFetchDAOMembers(tokenHolderAddress: string) {
  return useQuery<Member[] | undefined, Error, Member[] | undefined, UseFetchDAOMembersQueryKey>(
    [DAOQueries.FetchDAOMembers, tokenHolderAddress],
    async () => {
      if (isNil(tokenHolderAddress)) return;
      const events = await DexService.fetchUpgradeContractEvents(tokenHolderAddress, [DAOEvents.UpdatedAmount]);
      if (isNil(events)) return [];
      const amountUpdatedEvents = events.get(DAOEvents.UpdatedAmount) ?? [];
      const daoMembers: UpdateAmountEventData[] = [];
      amountUpdatedEvents
        .slice()
        .reverse()
        .forEach((log: any) => {
          const memberIndex = daoMembers.findIndex((obj) => obj.user === log.user);
          if (memberIndex === -1) {
            daoMembers.push(log);
          } else {
            daoMembers[memberIndex] = { ...log };
          }
        });
      const activeMemberWithLockedBalance = await Promise.all(
        daoMembers
          .filter((member) => member.idOrAmount > 0)
          .map(async (member) => {
            try {
              const accountInfo = await DexService.fetchAccountInfo(member.user);
              return { name: "-", logo: "", accountId: accountInfo.account };
            } catch (error) {
              console.warn(`Could not fetch account info for ${member.user}, using EVM address:`, error);
              return { name: "-", logo: "", accountId: member.user };
            }
          })
      );
      return activeMemberWithLockedBalance;
    },
    {
      enabled: !!tokenHolderAddress,
    }
  );
}
