import { TokenBalance } from "@dex/hooks";
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
  infoUrl: string;
  isPrivate: boolean;
  description: string;
  webLinks: string[];
}

export type MultiSigDAOCreatedEventInputs = DAOCreatedEventArgs & {
  owners: string[];
  threshold: BigNumber;
};

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
  inputs: MultiSigDAOCreatedEventInputs;
}

export interface DAODetailsInfoEventArgs {
  name: string;
  logoUrl: string;
  description: string;
  webLinks: string[];
}

export interface GovernanceDAODetails {
  type: DAOType.GovernanceToken;
  accountEVMAddress: string;
  adminId: string;
  title: string;
  description: string;
  infoUrl: string | undefined;
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
  accountEVMAddress: string;
  adminId: string;
  title: string;
  description: string;
  infoUrl: string | undefined;
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
  accountEVMAddress: string;
  adminId: string;
  name: string;
  logoUrl: string;
  webLinks: string[];
  isPrivate: boolean;
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
  UpdatedAmount = "UpdatedAmount",
  DAOConfig = "DAOConfig",
}

export enum HederaGnosisSafeFunctions {
  ApproveHash = "approveHash",
  ExecuteTransaction = "executeTransaction",
}

export enum MultiSigProposeTransactionType {
  BatchOperation = 1,
  TokenAssociation,
  UpgradeProxy,
  TokenTransfer,
  AddMember = 1001,
  DeleteMember,
  ReplaceMember,
  ChangeThreshold,
  TypeSetText,
  HBARTokenTransfer,
}
export interface Member {
  name: string;
  logo: string;
  accountId: string;
}

export type DAODetailsContext = {
  dao: DAO;
  tokenBalances: TokenBalance[];
  blockedBalance: number | number[];
};

export enum GovernanceProposalOperationType {
  TokenTransfer = 1,
  TokenAssociation,
  HBarTransfer,
}
export interface UpgradeContractDetails {
  type: string;
  proxy: string;
  proxyAdmin: string;
  proxyLogic: string;
}
export interface TokenTransferDetails {
  type: string;
  transferToAccount: string;
  tokenToTransfer: string;
  transferTokenAmount: number;
}
export interface TokenAssociateProposalDetails {
  type: string;
  tokenAddress: string;
}

export type ProposalDataDetails =
  | UpgradeContractDetails
  | TokenTransferDetails
  | TokenAssociateProposalDetails
  | undefined;

export enum NFTDAOFunctions {
  GrabTokensFromUser = "grabTokensFromUser",
  RevertTokensForVoter = "revertTokensForVoter",
}
