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
  governorAddress: string;
  assetsHolderAddress: string;
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
  governorAddress: string;
  assetsHolderAddress: string;
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
  infoUrl: string;
  description: string;
  webLinks: string[];
}

export interface LockedTokenDetails {
  idOrAmount: string;
  operation: string;
  user: string;
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
  governorAddress: string;
  assetsHolderAddress: string;
  tokenHolderAddress: string;
  webLinks: string[];
  quorumThreshold: number;
  votingDelay: number;
  votingPeriod: number;
  minimumProposalDeposit?: number;
  lockedTokenDetails?: LockedTokenDetails[];
}

export interface NFTDAODetails {
  type: DAOType.NFT;
  accountEVMAddress: string;
  adminId: string;
  title: string;
  description: string;
  infoUrl: string | undefined;
  governorAddress: string;
  assetsHolderAddress: string;
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
  lockedTokenDetails?: LockedTokenDetails[];
}

export interface MultiSigDAODetails {
  type: DAOType.MultiSig;
  title: string;
  description: string;
  infoUrl: string | undefined;
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
  infoUrl: string;
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
  DAOConfig = "FeeConfigUpdated",
  FeeConfigControllerChanged = "FeeConfigControllerChanged",
  UpdatedUsers = "UpdatedUsers",
}

export enum HederaGnosisSafeFunctions {
  ApproveHash = "approveHash",
  ExecuteTransaction = "executeTransaction",
  ChangeFeeConfigController = "changeFeeConfigController",
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
  GenericProposal,
}
export interface Member {
  name: string;
  logo: string;
  accountId: string;
}

export type DAODetailsContext = {
  dao: DAO;
  tokenBalances: TokenBalance[];
};

export enum GovernanceProposalOperationType {
  TokenTransfer = 1,
  TokenAssociation,
  HBarTransfer,
}
export interface UpgradeContractDetails {
  type: number;
  proxy: string;
  proxyAdmin: string;
  proxyLogic: string;
}
export interface TokenTransferDetails {
  type: number;
  transferToAccount: string;
  tokenToTransfer: string;
  transferTokenAmount: number;
}
export interface TokenAssociateProposalDetails {
  type: number;
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
