import { DAOConfigDetails } from "@dao/hooks";
import { DAOType } from "@dao/services";

export enum DAOGovernanceTokenType {
  NewToken = "New Token",
  ExistingToken = "Existing Token",
}

export enum DAONFTTokenType {
  NewNFT = "New NFT",
  ExistingNFT = "Existing NFT",
}

export interface TokenDAOGovernanceData {
  tokenType: DAOGovernanceTokenType;
  newToken: {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    initialSupply: number;
    id: string;
    tokenWalletAddress: string;
    treasuryWalletAccountId: string;
  };
  existingToken: {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    initialSupply: number;
    supplyKey: string;
    id: string;
    treasuryWalletAccountId: string;
    mirrorNodeTokenId: string | undefined;
    tokenType: string | undefined;
  };
}

export interface TokenDAOVotingData {
  minProposalDeposit: number;
  quorum: number;
  duration: number;
  durationUnit: number;
  lockingPeriod: number;
  lockingPeriodUnit: number;
  strategy: string;
}

export interface MultiSigDAOGovernanceData {
  admin: string;
  owners: Record<"value", string>[];
}

export interface NFTDAOGovernanceData {
  tokenType: DAONFTTokenType;
  newNFT: {
    name: string;
    symbol: string;
    logo: string;
    maxSupply: number;
    id: string;
    tokenWalletAddress: string;
    treasuryWalletAccountId: string;
  };
  existingNFT: {
    name: string;
    symbol: string;
    logo: string;
    maxSupply: number;
    id: string;
    tokenWalletAddress: string;
    treasuryWalletAccountId: string;
    tokenType: string;
  };
}

export interface NFTDAOVotingData {
  minProposalDeposit: number;
  quorum: number;
  duration: number;
  durationUnit: number;
  lockingPeriod: number;
  lockingPeriodUnit: number;
}

export interface MultiSigDAOVotingData {
  threshold: number;
}

export interface CreateADAOFormBase {
  name: string;
  description: string;
  logoUrl?: string;
  infoUrl: string;
  isPublic?: boolean;
  daoLinks: Record<"value", string>[];
  type: DAOType;
  disclaimer?: boolean;
}

export interface CreateATokenDAOForm extends CreateADAOFormBase {
  governance: TokenDAOGovernanceData;
  voting: TokenDAOVotingData;
}

export interface CreateAMultiSigDAOForm extends CreateADAOFormBase {
  governance: MultiSigDAOGovernanceData;
  voting: MultiSigDAOVotingData;
}

export interface CreateANFTDAOForm extends CreateADAOFormBase {
  governance: NFTDAOGovernanceData;
  voting: NFTDAOVotingData;
}

export type CreateDAOContext = {
  multisigDAOFeeConfig: DAOConfigDetails;
  ftDAOFeeConfig: DAOConfigDetails;
  nftDAOFeeConfig: DAOConfigDetails;
};

export type CreateADAOForm = CreateATokenDAOForm | CreateAMultiSigDAOForm | CreateANFTDAOForm;
