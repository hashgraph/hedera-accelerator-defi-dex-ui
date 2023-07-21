import { ProposalState } from "@dex-ui/store/governanceSlice";
import { MirrorNodeTokenById } from "@services";

export enum DAOQueries {
  DAOs = "daos",
  Proposals = "proposals",
  GodTokens = "godTokens",
}

export enum DAOMutations {
  CreateDAO = "CreateDAO",
  CreateMultiSigProposal = "CreateMultiSigProposal",
  CreateTokenTransferProposal = "CreateTokenTransferProposal",
  CreateTokenAssociateProposal = "CreateTokenAssociateProposal",
  CreateDAOUpgradeProposal = "CreateDAOUpgradeProposal",
  CreateDAOTextProposal = "CreateDAOTextProposal",
  CreateAddMemberProposal = "CreateAddMemberProposal",
  CreateDeleteMemberProposal = "CreateDeleteMemberProposal",
  CreateReplaceMemberProposal = "CreateReplaceMemberProposal",
  CreateChangeThresholdProposal = "CreateChangeThresholdProposal",
  ApproveProposal = "ApproveProposal",
  ExecuteProposal = "ExecuteProposal",
  UpdateDAODetails = "UpdateDAODetails",
  MintNFTTokens = "MintNFTTokens",
}

export enum ProposalStatus {
  Pending = "Active",
  Queued = "Queued",
  Success = "Passed",
  Failed = "Failed",
}

export enum ProposalEvent {
  Send = "Send",
  Receive = "Receive",
  Governance = "Governance",
  SafeCreated = "Safe Created",
}

export enum ProposalType {
  TokenTransfer = "Token Transfer",
  AddNewMember = "Add Member",
  RemoveMember = "Remove Member",
  ReplaceMember = "Replace Member",
  ChangeThreshold = "Upgrade Threshold",
  TokenAssociate = "Token Associate",
  UpgradeContract = "Upgrade Contract",
  TextProposal = "Text Proposal",
}

export interface Votes {
  yes: number | undefined;
  no: number | undefined;
  abstain: number | undefined;
  quorum: number | undefined;
  remaining: number | undefined;
  max: number | undefined;
  turnout: number | undefined;
}

export interface Proposal {
  id: number;
  nonce: number;
  transactionHash?: string;
  amount: number;
  type: ProposalType;
  approvalCount: number;
  approvers: string[];
  event: ProposalEvent;
  status: ProposalStatus;
  timestamp: string;
  tokenId: string;
  token: MirrorNodeTokenById | null | undefined;
  receiver: string;
  sender?: string;
  safeId: string;
  operation: number;
  hexStringData: string;
  /**
   * The hbar value sent when creating the proposal. This value is needed to
   * compute the correct hash value when executing the proposal in the HederaGnosisSafe contract.
   **/
  msgValue: number;
  title: string;
  author: string;
  description: string;
  link: string | undefined;
  threshold: number | undefined;
  proposalId?: string;
  contractId?: string;
  timeRemaining?: string;
  votes?: Votes;
  hasVoted?: boolean;
  isQuorumReached?: boolean;
  votingEndTime?: string;
  proposalState?: ProposalState;
  tokenToAssociate?: string | undefined;
}

export const AllFilters = [
  ProposalStatus.Success,
  ProposalStatus.Failed,
  ProposalStatus.Pending,
  ProposalStatus.Queued,
];
