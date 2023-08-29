import { formatProposal } from "../../pages/Governance/formatter";
import { FormattedProposal } from "../../pages/Governance/types";
import { Proposal, ProposalStatus } from "../../store/governanceSlice";
import { isNil } from "ramda";
import { GovernanceQueries } from "./types";
import { useQuery } from "react-query";
import { DexService } from "@dex/services";

const defaultStatusFilter = [...Object.values(ProposalStatus)];
const proposalStatusSortOrder = [ProposalStatus.Active, ProposalStatus.Passed, ProposalStatus.Failed];
interface UseAllProposalsProps {
  titleFilter?: string;
  statusFilters?: ProposalStatus[];
  startDate?: Date | null;
  endDate?: Date | null;
}

type UseAllProposalsQueryKey = [GovernanceQueries.Proposals, "list"];

export function useAllProposals(props: UseAllProposalsProps) {
  const { startDate, endDate, statusFilters = defaultStatusFilter, titleFilter = "" } = props;

  function sortProposalCompareFn(proposalA: FormattedProposal, proposalB: FormattedProposal) {
    if (!isNil(proposalA.status) && !isNil(proposalB.status)) {
      return proposalStatusSortOrder.indexOf(proposalA.status) - proposalStatusSortOrder.indexOf(proposalB.status);
    }
    return 0;
  }

  function filterFormatSortProposals(data: Proposal[]) {
    const formattedProposals = data.reduce((formattedProposals: FormattedProposal[], proposal): FormattedProposal[] => {
      const doesTitleFilterMatch = proposal.title?.toLowerCase().includes(titleFilter.toLowerCase());
      const doesStatusFilterMatch = !isNil(proposal?.status) && statusFilters.includes(proposal?.status);
      const isDateFilterApplied = !isNil(startDate) && !isNil(endDate);
      const timeStamp = Number(proposal.timestamp) * 1000;
      const doesDateFilterMatch =
        isDateFilterApplied &&
        startDate.getTime() <= new Date(timeStamp).getTime() &&
        new Date(timeStamp).getTime() <= endDate.getTime();

      if (doesDateFilterMatch && doesTitleFilterMatch && doesStatusFilterMatch) {
        const formattedProposal = formatProposal(proposal);
        return [...formattedProposals, formattedProposal];
      } else if (!isDateFilterApplied && doesTitleFilterMatch && doesStatusFilterMatch) {
        const formattedProposal = formatProposal(proposal);
        return [...formattedProposals, formattedProposal];
      } else {
        return formattedProposals;
      }
    }, []);

    return formattedProposals.sort(sortProposalCompareFn);
  }

  return useQuery<Proposal[], Error, FormattedProposal[], UseAllProposalsQueryKey>(
    [GovernanceQueries.Proposals, "list"],
    async () => DexService.fetchAllProposals(),
    {
      keepPreviousData: true,
      select: filterFormatSortProposals,
    }
  );
}
