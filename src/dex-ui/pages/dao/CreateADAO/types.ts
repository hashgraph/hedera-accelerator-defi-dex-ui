import { DAOType } from "../../../services";

export interface TokenDAOGovernanceData {
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    initialSupply: number;
    supplyKey: string;
    id: string;
    treasuryWalletAccountId: string;
  };
}

export interface TokenDAOVotingData {
  minProposalDeposit: number;
  quorum: number;
  duration: number;
  lockingPeriod: number;
  strategy: string;
}

export interface MultiSigDAOGovernanceData {
  admin: string;
  owners: Record<"value", string>[];
}

export interface NFTDAOGovernanceData {
  nft: {
    name: string;
    symbol: string;
    logo: string;
    maxSupply: number;
    supplyKey: string;
    id: string;
    treasuryWalletAccountId: string;
  };
}

export interface NFTDAOVotingData {
  minProposalDeposit: number;
  quorum: number;
  duration: number;
  lockingPeriod: number;
}

export interface MultiSigDAOVotingData {
  threshold: number;
}

export interface CreateADAOFormBase {
  name: string;
  description: string;
  logoUrl?: string;
  isPublic?: boolean;
  type: DAOType;
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

export type CreateADAOForm = CreateATokenDAOForm | CreateAMultiSigDAOForm | CreateANFTDAOForm;
