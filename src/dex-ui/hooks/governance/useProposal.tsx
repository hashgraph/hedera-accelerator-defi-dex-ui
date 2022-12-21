import { BigNumber } from "bignumber.js";
import { formatProposal } from "../../pages/Governance/formatter";
import { FormattedProposal } from "../../pages/Governance/types";
import { Proposal } from "../../store/governanceSlice";
import { isNil } from "ramda";
import { useProposalQuery } from "./queries";

export function useProposal(id: string | undefined) {
  const getProposal = (data: Proposal[]) => {
    const proposal = data.find((proposal: Proposal) => !isNil(id) && BigNumber(id).eq(proposal.id));
    return proposal ? formatProposal(proposal) : undefined;
  };
  return useProposalQuery<FormattedProposal | undefined>(getProposal);
}
