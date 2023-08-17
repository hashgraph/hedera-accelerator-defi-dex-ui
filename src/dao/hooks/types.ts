import { ProposalState } from "@dex/store";
import { MirrorNodeTokenById } from "@dex/services";

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
  CreateGOVTokenAssociateProposal = "CreateGOVTokenAssociateProposal",
  CreateDAOUpgradeProposal = "CreateDAOUpgradeProposal",
  CreateDAOTextProposal = "CreateDAOTextProposal",
  CreateMultiSigDAOTextProposal = "CreateMultiSigDAOTextProposal",
  CreateAddMemberProposal = "CreateAddMemberProposal",
  CreateDeleteMemberProposal = "CreateDeleteMemberProposal",
  CreateReplaceMemberProposal = "CreateReplaceMemberProposal",
  CreateChangeThresholdProposal = "CreateChangeThresholdProposal",
  CreateMultiSigDAOUpgradeProposal = "CreateMultiSigDAOUpgradeProposal",
  ApproveProposal = "ApproveProposal",
  ExecuteProposal = "ExecuteProposal",
  UpdateDAODetails = "UpdateDAODetails",
  MintNFTTokens = "MintNFTTokens",
  DepositTokens = "DepositTokens",
  ChangeAdmin = "ChangeAdmin",
}

export enum ProposalStatus {
  Pending = "Active",
  Queued = "Queued",
  Success = "Executed",
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

export interface ProposalDataTokenTransfer {
  token: string;
  receiver: string;
  amount: string;
}

export interface ProposalDataHbarTransfer {
  token: string;
  receiver: string;
  amount: string;
}
export interface ProposalDataTokenAssociation {
  tokenAddress: string;
}

export interface ProposalDataAddMember {
  owner: string;
  _threshold: string;
}

export interface ProposalDataDeleteMember {
  owner: string;
  _threshold: string;
}

export interface ProposalDataReplaceMember {
  oldOwner: string;
  newOwner: string;
}

export interface ProposalDataChangeThreshold {
  _threshold: string;
}

export interface ProposalDataGovernanceTokenTransfer {
  transferFromAccount: string;
  transferToAccount: string;
  tokenToTransfer: string;
  transferTokenAmount: number;
}

export interface DAOUpgradeProposal {
  proxy: string;
  proxyLogic: string;
  proxyAdmin: string;
  currentLogic: string;
}

export type ProposalData =
  | ProposalDataTokenTransfer
  | ProposalDataHbarTransfer
  | ProposalDataTokenAssociation
  | ProposalDataAddMember
  | ProposalDataDeleteMember
  | ProposalDataReplaceMember
  | ProposalDataChangeThreshold
  | ProposalDataGovernanceTokenTransfer
  | DAOUpgradeProposal;

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
  safeAccountId: string;
  to: string;
  operation: number;
  hexStringData: string;
  data: ProposalData;
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
  /**
   * TODO: To be removed
   * Extra objects to check for DAO upgrade Proposal
   **/
  isContractUpgradeProposal?: boolean;
}

export const AllFilters = [
  ProposalStatus.Success,
  ProposalStatus.Failed,
  ProposalStatus.Pending,
  ProposalStatus.Queued,
];
