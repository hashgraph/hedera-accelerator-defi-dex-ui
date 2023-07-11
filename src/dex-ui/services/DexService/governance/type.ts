import BigNumber from "bignumber.js";
import { MirrorNodeDecodedProposalEvent } from "../../MirrorNodeService";

interface Duration {
  startBlock: string;
  endBlock: string;
}

interface VotingInformation {
  abstainVotes: BigNumber | undefined;
  againstVotes: BigNumber | undefined;
  forVotes: BigNumber | undefined;
  isQuorumReached: boolean;
  proposalState: number;
  quorumValue: BigNumber | undefined;
  voted: boolean;
  votedUser: string;
}

interface ProposalDetailsResponse {
  quorum: BigNumber;
  isQuorumReached: boolean;
  state: number;
  hasVoted: boolean;
  againstVotes: BigNumber;
  forVotes: BigNumber;
  abstainVotes: BigNumber;
  creator: string;
  title: string;
  description: string;
  link: string;
  transferFromAccount?: string | undefined;
  transferToAccount?: string | undefined;
  tokenToTransfer?: string | undefined;
  transferTokenAmount?: number | undefined;
  votingInformation?: VotingInformation;
  duration?: Duration;
}

export type ProposalData = MirrorNodeDecodedProposalEvent & ProposalDetailsResponse;

export enum GovernanceEvent {
  ProposalCreated = "ProposalCreated",
  ProposalExecuted = "ProposalExecuted",
  ProposalCanceled = "ProposalCanceled",
  CanClaimAmount = "CanClaimAmount",
}
