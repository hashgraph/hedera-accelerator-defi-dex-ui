import { AccountId } from "@hashgraph/sdk";
import { ProposalStatus, ProposalState } from "../../store/governanceSlice";

interface Proposal {
  title: string;
  author: AccountId;
  description: string;
  status: ProposalStatus;
  timeRemaining: string;
  state: ProposalState;
  voteCount: {
    yes: number;
    no: number;
    abstain: number;
  };
}

export type { Proposal, ProposalStatus };
