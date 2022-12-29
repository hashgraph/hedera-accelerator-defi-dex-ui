import { useProposalQuery } from "./queries";
import { formatProposal } from "../../pages/Governance/formatter";
import { FormattedProposal } from "../../pages/Governance/types";
import { Proposal, ProposalStatus } from "../../store/governanceSlice";
import { isNil } from "ramda";

const defaultStatusFilter = [...Object.values(ProposalStatus)];
const proposalStatusSortOrder = [ProposalStatus.Active, ProposalStatus.Passed, ProposalStatus.Failed];
interface UseAllProposalsParams {
  titleFilter?: string;
  statusFilters?: ProposalStatus[];
}

export function useAllProposals({ titleFilter = "", statusFilters = defaultStatusFilter }: UseAllProposalsParams) {
  function filterFormatSortProposals(data: Proposal[]) {
    const formattedProposals = data.reduce((formattedProposals: FormattedProposal[], proposal): FormattedProposal[] => {
      const doesTitleFilterMatch = proposal.title?.toLowerCase().includes(titleFilter.toLowerCase());
      const doesStatusFilterMatch = !isNil(proposal?.status) && statusFilters.includes(proposal?.status);
      if (doesTitleFilterMatch && doesStatusFilterMatch) {
        const formattedProposal = formatProposal(proposal);
        return [...formattedProposals, formattedProposal];
      }
      return formattedProposals;
    }, []);
    return formattedProposals.sort(sortProposalCompareFn);
  }

  function sortProposalCompareFn(a: FormattedProposal, b: FormattedProposal) {
    if (!isNil(a.status) && !isNil(b.status)) {
      return proposalStatusSortOrder.indexOf(a.status) - proposalStatusSortOrder.indexOf(b.status);
    }
    return 0;
  }

  return useProposalQuery<FormattedProposal[]>(filterFormatSortProposals);
}
