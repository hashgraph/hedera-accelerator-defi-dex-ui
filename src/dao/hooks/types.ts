import { ProposalState } from "@dex/store";
import { MirrorNodeTokenById, ProposalCoreInformation } from "@dex/services";

export enum DAOQueries {
  DAOs = "daos",
  Proposals = "proposals",
  GodTokens = "godTokens",
  FetchLockNFTToken = "fetchLockNFTToken",
  FetchCanUnlockNFTToken = "fetchCanUnlockNFTToken",
  FetchBlockedTokenBalance = "fetchBlockedTokenBalance",
  FetchDAOMembers = "fetchDAOMembers",
  Contract = "contract",
  Config = "Config",
  IPFSContent = "IPFSContent",
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
  LockNFTToken = "lockNFTToken",
  UnlockNFTToken = "unlockNFTToken",
  PinToIPFS = "PinToIPFS",
  TransferOwnership = "TransferOwnership",
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

export enum GovernanceEvent {
  NFTSerialIdBlockStatus = "NFTSerialIdBlockStatus",
  GovernorBalance = "GovernorBalance",
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
  GenericProposal = "Generic Proposal",
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

export interface GOVUpgradeProposalDetails {
  proxy: string;
  proxyAdmin: string;
  proxyLogic: string;
  currentLogic: string;
  isAdminApproved: boolean;
  isAdminApprovalButtonVisible: boolean;
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
  | DAOUpgradeProposal
  | GOVUpgradeProposalDetails;

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
  safeEVMAddress: string;
  to: string;
  operation: number;
  hexStringData: string;
  data: ProposalData | undefined;
  /**
   * The hbar value sent when creating the proposal. This value is needed to
   * compute the correct hash value when executing the proposal in the HederaGnosisSafe contract.
   **/
  msgValue: number;
  title: string;
  author: string;
  description: string;
  metadata: string;
  link: string | undefined;
  threshold: number | undefined;
  proposalId?: string;
  contractEvmAddress?: string;
  timeRemaining?: number;
  votes?: Votes;
  hasVoted?: boolean;
  isQuorumReached?: boolean;
  votingEndTime?: number;
  proposalState?: ProposalState;
  coreInformation?: ProposalCoreInformation;
  showTransferOwnerShip?: boolean;
  currentOwner?: string | undefined;
  targetId?: string;
  feeConfigControllerUser?: string;

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
export interface BlockedNFTEvent {
  nftSerialId: number;
  isBlocked: boolean;
}
export interface UpdateAmountEventData {
  user: string;
  idOrAmount: number;
}

export interface DAOConfigDetails {
  daoFee: number;
  daoTreasurer: string;
  tokenAddress: string;
  symbol: string;
  tokenId: string;
  tokenType: string;
  decimals: number;
  preciseDAOFee: number;
}
export interface DAOConfig {
  multisigDAOFeeConfig: DAOConfigDetails;
  ftDAOFeeConfig: DAOConfigDetails;
  nftDAOFeeConfig: DAOConfigDetails;
}

export enum DAOTabs {
  All = "All",
  MyDAOs = "My DAOs",
}
