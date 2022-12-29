import { GovernanceQueries } from "./types";
import { useQuery } from "react-query";
import { DexService } from "../../services";
import { Proposal } from "../../store/governanceSlice";

export function useProposalQuery<T>(select: (data: Proposal[]) => T) {
  return useQuery<Proposal[], Error, T, GovernanceQueries.FetchAllProposals>(
    GovernanceQueries.FetchAllProposals,
    async () => DexService.fetchAllProposals(),
    {
      keepPreviousData: true,
      select,
    }
  );
}
