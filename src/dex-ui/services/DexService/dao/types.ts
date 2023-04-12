import { BigNumber } from "ethers";

export enum DAOType {
  GovernanceToken = "Governance Token",
  MultiSig = "MultiSig",
}
export interface DAOCreatedEventArgs {
  daoAddress: string;
  admin: string;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
}

export interface GovernanceDAOCreatedEventArgs extends DAOCreatedEventArgs {
  tokenAddress: string;
  quorumThreshold: BigNumber;
  votingDelay: BigNumber;
  votingPeriod: BigNumber;
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
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  tokenId: string;
  quorumThreshold: number;
  votingDelay: number;
  votingPeriod: number;
}

export interface MultiSigDAODetails {
  type: DAOType.MultiSig;
  accountId: string;
  adminId: string;
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  safeId: string;
  ownerIds: string[];
  threshold: number;
}

export type DAO = MultiSigDAODetails | GovernanceDAODetails;

export enum DAOEvents {
  DAOCreated = "DAOCreated",
  TransactionCreated = "TransactionCreated",
  ApproveHash = "ApproveHash",
  ExecutionSuccess = "ExecutionSuccess",
  ExecutionFailure = "ExecutionFailure",
}
