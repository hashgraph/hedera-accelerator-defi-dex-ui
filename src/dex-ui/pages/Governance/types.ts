import { AccountId } from "@hashgraph/sdk";

type VotingStatus = "Review" | "Active" | "Queued to Execute" | "Executed";
type ProposalStatus = "Active" | "Passed" | "Failed";

interface Proposal {
  title: string;
  author: AccountId;
  description: string;
  status: ProposalStatus;
  timeRemaining: string;
  voteCount: {
    yes: number;
    no: number;
    abstain: number;
  };
}

export type { Proposal, VotingStatus, ProposalStatus };
