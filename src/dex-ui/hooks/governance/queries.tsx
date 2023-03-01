import { GovernanceQueries } from "./types";
import { useQuery } from "react-query";
import { DexService } from "../../services";
import { Proposal } from "../../store/governanceSlice";
import { MILLISECONDS_IN_A_SECOND } from "../../utils";

const StaleTimeInSeconds = 10;

export function useProposalQuery<T>(select: (data: Proposal[]) => T) {
  return useQuery<Proposal[], Error, T, GovernanceQueries.FetchAllProposals>(
    GovernanceQueries.FetchAllProposals,
    async () => DexService.fetchAllProposals(),
    {
      staleTime: MILLISECONDS_IN_A_SECOND * StaleTimeInSeconds,
      keepPreviousData: true,
      select,
    }
  );
}
