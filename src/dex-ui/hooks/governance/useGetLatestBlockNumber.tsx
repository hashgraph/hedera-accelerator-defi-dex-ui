import { DexService } from "@services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isEmpty, isNil } from "ramda";

type UseProposalBlockNumberQueryKey = [GovernanceQueries.GetLatestBlockNumber, string | undefined];

export function useGetLatestBlockNumber(id: string | undefined, timestamp: string | undefined, enableQuery: boolean) {
  return useQuery<number | undefined, Error, number | undefined, UseProposalBlockNumberQueryKey>(
    [GovernanceQueries.GetLatestBlockNumber, id],
    async () => {
      if (isNil(timestamp)) return;
      const blocks = await DexService.fetchLatestBlockNumber(timestamp);
      const latestBlock = isEmpty(blocks) ? undefined : blocks[0].number;
      return latestBlock;
    },
    {
      enabled: !!enableQuery,
      refetchInterval: 30000,
    }
  );
}
