import { Proposal } from "../../store/governanceSlice";
import { DexService } from "@dex/services";
import { useQuery } from "react-query";
import { GovernanceQueries } from "./types";
import { isNil } from "ramda";

type UseProposalQueryKey = [GovernanceQueries.Proposals, "detail", string | undefined];

export function useProposal(id: string | undefined) {
  return useQuery<Proposal | undefined, Error, Proposal, UseProposalQueryKey>(
    [GovernanceQueries.Proposals, "detail", id],
    async () => {
      if (isNil(id)) return;
      return DexService.fetchProposal(id);
    },
    {
      keepPreviousData: true,
      enabled: !!id,
    }
  );
}
