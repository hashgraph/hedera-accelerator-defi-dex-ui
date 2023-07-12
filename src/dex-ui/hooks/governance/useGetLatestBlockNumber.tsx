import { DexService } from "@services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";

type UseProposalBlockNumberQueryKey = [GovernanceQueries.GetLatestBlockNumber, string | undefined];

export function useGetLatestBlockNumber(id: string | undefined, timestamp: string) {
  return useQuery<number | undefined, Error, number, UseProposalBlockNumberQueryKey>(
    [GovernanceQueries.GetLatestBlockNumber, id],
    async () => {
      if (isNil(id)) return;
      const blocks = await DexService.fetchLatestBlockNumber(timestamp);
      const asa = blocks[0];
      return 0;
    },
    {
      keepPreviousData: true,
      enabled: !!(id && timestamp),
    }
  );
}
