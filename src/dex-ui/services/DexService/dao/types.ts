import { BigNumber } from "ethers";

export enum DAOType {
  GovernanceToken = "Governance Token",
  MultiSig = "MultiSig",
  NFT = "NFT",
}
export interface DAOCreatedEventArgs {
  daoAddress: string;
  admin: string;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  title: string;
  description: string;
  linkToDiscussion: string | undefined;
  webLinks: string;
}

export interface GovernanceDAOCreatedEventArgs extends DAOCreatedEventArgs {
  tokenAddress: string;
  quorumThreshold: BigNumber;
  votingDelay: BigNumber;
  votingPeriod: BigNumber;
  governanceAddress: string;
  tokenHolderAddress: string;
}

export interface NFTDAOCreatedEventArgs extends DAOCreatedEventArgs {
  tokenAddress: string;
  quorumThreshold: BigNumber;
  votingDelay: BigNumber;
  votingPeriod: BigNumber;
  governanceAddress: string;
  tokenHolderAddress: string;
}

export interface MultiSigDAOCreatedEventArgs extends DAOCreatedEventArgs {
  safeAddress: string;
  owners: string[];
  threshold: BigNumber;
}

export interface GovernanceDAODetails {
  type: DAOType.GovernanceToken;
  accountId: string;
  adminId: string;
  title: string;
  description: string;
  linkToDiscussion: string | undefined;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  tokenId: string;
  governanceAddress: string;
  tokenHolderAddress: string;
  webLinks: string;
  quorumThreshold: number;
  votingDelay: number;
  votingPeriod: number;
  minimumProposalDeposit?: number;
}

export interface NFTDAODetails {
  type: DAOType.NFT;
  accountId: string;
  adminId: string;
  title: string;
  description: string;
  linkToDiscussion: string | undefined;
  governanceAddress: string;
  tokenHolderAddress: string;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  webLinks: string;
  tokenId: string;
  quorumThreshold: number;
  votingDelay: number;
  votingPeriod: number;
  minimumProposalDeposit?: number;
}

export interface MultiSigDAODetails {
  type: DAOType.MultiSig;
  title: string;
  description: string;
  accountId: string;
  adminId: string;
  name: string;
  logoUrl: string;
  webLinks: string;
  isPrivate: boolean;
  safeId: string;
  ownerIds: string[];
  threshold: number;
}

export interface MultiSigDaoSettingForm {
  name: string;
  description: string;
  logoUrl?: string;
  isPublic?: boolean;
  daoLinks: Record<"value", string>[];
}

export type DAO = MultiSigDAODetails | GovernanceDAODetails | NFTDAODetails;

export enum DAOEvents {
  DAOCreated = "DAOCreated",
  TransactionCreated = "TransactionCreated",
  ApproveHash = "ApproveHash",
  ExecutionSuccess = "ExecutionSuccess",
  ExecutionFailure = "ExecutionFailure",
}

export enum HederaGnosisSafeFunctions {
  ApproveHash = "approveHash",
  ExecuteTransaction = "executeTransaction",
}

export enum MultiSigProposeTransactionType {
  TokenTransfer = 1,
  AddMember,
  DeleteMember,
  ReplaceMember,
  ChangeThreshold,
}
// TODO: if members are not present in Governance and NFT DAOs, then move it back with Multisig types
export interface Member {
  name: string;
  logo: string;
  accountId: string;
}

export type DAODetailsContext = {
  dao: DAO;
};
