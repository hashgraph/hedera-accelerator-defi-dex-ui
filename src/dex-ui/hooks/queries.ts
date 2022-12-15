import { useQuery } from "react-query";
import { formatProposal } from "../pages/Governance/formatter";
import { FormattedProposal } from "../pages/Governance/types";
import { DexService } from "../services";
import { Proposal } from "../store/governanceSlice";

export enum Queries {
  FetchAllProposals = "fetchAllProposals",
}

export function useAllProposals() {
  return useQuery<Proposal[], Error, FormattedProposal[], Queries.FetchAllProposals>(
    Queries.FetchAllProposals,
    async () => DexService.fetchAllProposals(),
    {
      select: (data: Proposal[]) => data.map(formatProposal),
    }
  );
}
