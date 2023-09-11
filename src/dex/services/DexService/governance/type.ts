import { MirrorNodeDecodedProposalEvent } from "@dex/services";
interface Duration {
  startBlock: string;
  endBlock: string;
}
interface VotingInformation {
  abstainVotes: number;
  againstVotes: number;
  forVotes: number;
  isQuorumReached: boolean;
  proposalState: number;
  quorumValue: number;
  voted: boolean;
  votedUser: string;
}

interface ProposalDetailsResponse {
  proposalId: string;
  contractId: string;
  type: string;
  proposer: string;
  description: string;
  title: string;
  link: string;
  timestamp: string;
  nftTokenSerialId: string;
  duration: Duration;
  data: string | undefined;
  transferFromAccount?: string | undefined;
  transferToAccount?: string | undefined;
  tokenToTransfer?: string | undefined;
  transferTokenAmount?: number | undefined;
  votingInformation?: VotingInformation;
  tokenAddress?: string;
  proxy?: string;
  proxyAdmin?: string;
  proxyLogic?: string;
  currentLogic?: string;
  isAdminApproved?: boolean;
  isAdminApprovalButtonVisible?: boolean;
  state?: number;
}

export type ProposalData = MirrorNodeDecodedProposalEvent & ProposalDetailsResponse;

export interface CanClaimDetails {
  canClaim: boolean;
  user: string;
}

export enum GovernanceEvent {
  ProposalCreated = "ProposalCreated",
  ProposalExecuted = "ProposalExecuted",
  ProposalCanceled = "ProposalCanceled",
  CanClaimAmount = "CanClaimAmount",
}
