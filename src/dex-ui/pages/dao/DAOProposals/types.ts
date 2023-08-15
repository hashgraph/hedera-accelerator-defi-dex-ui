import { TokenBalance } from "@dex-ui/hooks";

export enum DAOProposalType {
  Text = "Text",
  TokenAssociate = "Token Associate",
  TokenTransfer = "Token Transfer",
  UpgradeThreshold = "Upgrade Threshold",
  UpgradeVotingDuration = "Upgrade Voting Duration",
  AddMember = "Add Member",
  ReplaceMember = "Replace Member",
  RemoveMember = "Remove Member",
  Message = "Message",
  ContractUpgrade = "Upgrade DAO",
}

export interface CreateDAOProposalFormBase {
  title: string;
  description: string;
  type: DAOProposalType;
}

export interface CreateDAOTextProposalForm extends CreateDAOProposalFormBase {
  linkToDiscussion: string;
  nftTokenSerialId: number;
}

export interface CreateDAOTokenTransferForm extends CreateDAOProposalFormBase {
  recipientAccountId: string;
  linkToDiscussion: string;
  tokenId: string;
  amount: string | undefined;
  decimals: number;
}

export interface CreateDAOTokenAssociateForm extends CreateDAOProposalFormBase {
  tokenId: string;
  linkToDiscussion: string;
}

export interface CreateDAOMemberOperationForm extends CreateDAOProposalFormBase {
  memberAddress: string;
  newThreshold: number;
  newMemberAddress: string;
}

export interface CreateDAOUpgradeThresholdForm extends CreateDAOProposalFormBase {
  newThreshold: number;
}

export interface CreateDAOContractUpgradeForm extends CreateDAOProposalFormBase {
  linkToDiscussion: string;
  newImplementationAddress: string;
  oldProxyAddress: string;
}

export type CreateDAOProposalForm =
  | CreateDAOTextProposalForm
  | CreateDAOTokenTransferForm
  | CreateDAOMemberOperationForm
  | CreateDAOUpgradeThresholdForm
  | CreateDAOContractUpgradeForm
  | CreateDAOTokenAssociateForm;

export type CreateDAOProposalContext = {
  daoType: string;
  daoAccountId: string;
  safeAccountId: string;
  threshold: number;
  membersCount: number;
  proposalType: DAOProposalType;
  assets: TokenBalance[];
  governanceTokenId: string;
};
