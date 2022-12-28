import { useProposalQuery } from "./queries";
import { formatProposal } from "../../pages/Governance/formatter";
import { FormattedProposal } from "../../pages/Governance/types";
import { Proposal, ProposalStatus } from "../../store/governanceSlice";
import { isNil } from "ramda";

const defaultStatusFilter = [...Object.values(ProposalStatus)];
const proposalStatusSortOrder = [ProposalStatus.Active, ProposalStatus.Passed, ProposalStatus.Failed];
interface UseAllProposalsProps {
  titleFilter?: string;
  statusFilters?: ProposalStatus[];
}

export function useAllProposals(props: UseAllProposalsProps) {
  const { titleFilter = "", statusFilters = defaultStatusFilter } = props;

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
      if (doesTitleFilterMatch && doesStatusFilterMatch) {
        const formattedProposal = formatProposal(proposal);
        return [...formattedProposals, formattedProposal];
      }
      return formattedProposals;
    }, []);
    return formattedProposals.sort(sortProposalCompareFn);
  }

  return useProposalQuery<FormattedProposal[]>(filterFormatSortProposals);
}
