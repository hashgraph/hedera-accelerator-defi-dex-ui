import { ProposalStatus, ProposalState } from "../../store/governanceSlice";

interface FormattedProposal {
  title: string | undefined;
  author: string;
  description: string;
  status: ProposalStatus | undefined;
  timeRemaining: string;
  state: ProposalState | undefined;
  voteCount: {
    yes: number | undefined;
    no: number | undefined;
    abstain: number | undefined;
  };
}

export type { FormattedProposal, ProposalStatus };
