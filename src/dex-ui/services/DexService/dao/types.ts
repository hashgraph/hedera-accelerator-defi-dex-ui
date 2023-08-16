import { BigNumber } from "ethers";

export enum DAOType {
  GovernanceToken = "Governance Token",
  MultiSig = "MultiSig",
  NFT = "NFT",
}
export interface DAOCreatedEventArgs {
  admin: string;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  title: string;
  description: string;
  linkToDiscussion: string | undefined;
  webLinks: string[];
}

export interface DAOProposalGovernors {
  contractUpgradeLogic: string;
  createTokenLogic: string;
  textLogic: string;
  tokenTransferLogic: string;
}

export interface GovernanceDAOCreatedEventArgs {
  daoAddress: string;
  governors: DAOProposalGovernors;
  tokenHolderAddress: string;
  inputs: DAOCreatedEventArgs & {
    tokenAddress: string;
    quorumThreshold: BigNumber;
    votingDelay: BigNumber;
    votingPeriod: BigNumber;
  };
}

export interface NFTDAOCreatedEventArgs {
  daoAddress: string;
  governors: DAOProposalGovernors;
  tokenHolderAddress: string;
  inputs: DAOCreatedEventArgs & {
    tokenAddress: string;
    quorumThreshold: BigNumber;
    votingDelay: BigNumber;
    votingPeriod: BigNumber;
  };
}

export interface MultiSigDAOCreatedEventArgs {
  daoAddress: string;
  safeAddress: string;
  inputs: DAOCreatedEventArgs & {
    owners: string[];
    threshold: BigNumber;
  };
}

export interface DAODetailsInfoEventArgs {
  name: string;
  logoUrl: string;
  description: string;
  webLinks: string[];
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
  governors: DAOProposalGovernors;
  tokenHolderAddress: string;
  webLinks: string[];
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
  governors: DAOProposalGovernors;
  tokenHolderAddress: string;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  webLinks: string[];
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
  webLinks: string[];
  isPrivate: boolean;
  safeId: string;
  safeEVMAddress: string;
  ownerIds: string[];
  threshold: number;
}

export interface DAOSettingsDetails {
  name: string;
  description: string;
  logoUrl: string;
  webLinks: string[];
}

export type DAO = MultiSigDAODetails | GovernanceDAODetails | NFTDAODetails;

export enum DAOEvents {
  DAOCreated = "DAOCreated",
  TransactionCreated = "TransactionCreated",
  ApproveHash = "ApproveHash",
  ExecutionSuccess = "ExecutionSuccess",
  ExecutionFailure = "ExecutionFailure",
  AddedOwner = "AddedOwner",
  SafeSetup = "SafeSetup",
  RemovedOwner = "RemovedOwner",
  ChangedThreshold = "ChangedThreshold",
  DAOInfoUpdated = "DAOInfoUpdated",
  ChangeAdmin = "AdminChanged",
  Upgraded = "Upgraded",
}

export enum HederaGnosisSafeFunctions {
  ApproveHash = "approveHash",
  ExecuteTransaction = "executeTransaction",
}

export enum MultiSigProposeTransactionType {
  BatchOperation = 1,
  TokenAssociation,
  UpgradeProxy,
  AddMember = 1001,
  DeleteMember,
  ReplaceMember,
  ChangeThreshold,
  TypeSetText,
  TokenTransfer,
  HBARTokenTransfer,
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

export enum GovernanceProposalOperationType {
  TokenTransfer = 1,
  TokenAssociation,
}
