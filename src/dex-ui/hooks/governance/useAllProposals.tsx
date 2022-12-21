import { useProposalQuery } from "./queries";
import { formatProposal } from "../../pages/Governance/formatter";
import { FormattedProposal } from "../../pages/Governance/types";
import { Proposal } from "../../store/governanceSlice";

export function useAllProposals() {
  const formatProposals = (data: Proposal[]) => data.map(formatProposal);
  return useProposalQuery<FormattedProposal[]>(formatProposals);
}
