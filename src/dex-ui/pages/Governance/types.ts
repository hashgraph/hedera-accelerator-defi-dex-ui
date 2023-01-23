import { ProposalStatus, ProposalState, ProposalType } from "../../store/governanceSlice";

interface FormattedProposal {
  id: string;
  contractId: string;
  type: ProposalType | undefined;
  title: string | undefined;
  author: string;
  description: string;
  link: string | undefined;
  status: ProposalStatus | undefined;
  timeRemaining: string | undefined;
  state: ProposalState | undefined;
  timestamp: string | undefined;
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
