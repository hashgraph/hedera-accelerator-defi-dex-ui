import { DAOType } from "../../../services";

export interface TokenDAOGovernanceData {
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    initialSupply: number;
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

export type CreateADAOForm = CreateATokenDAOForm | CreateAMultiSigDAOForm;
