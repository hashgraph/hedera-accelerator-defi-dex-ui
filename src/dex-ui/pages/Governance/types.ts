import { ProposalStatus, ProposalState } from "../../store/governanceSlice";

interface FormattedProposal {
  contractId: string;
  id: string;
  title: string | undefined;
  author: string;
  description: string;
  status: ProposalStatus | undefined;
  timeRemaining: string | undefined;
  state: ProposalState | undefined;
  votes: {
    yes: number | undefined;
    no: number | undefined;
    abstain: number | undefined;
    quorum: number | undefined;
    remaining: number | undefined;
    max: number | undefined;
  };
}

export type { FormattedProposal, ProposalStatus };
