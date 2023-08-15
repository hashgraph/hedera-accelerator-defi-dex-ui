export interface TextProposalFormData {
  title: string;
  description: string;
  linkToDiscussion: string;
}

export interface TokenTransferProposalFormData {
  title: string;
  description: string;
  linkToDiscussion: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: number;
}

export interface ContractUpgradeProposalFormData {
  title: string;
  description: string;
  linkToDiscussion: string;
  newContractProxyId: string;
  contractToUpgrade: string;
}

export interface CreateProposalLocationProps {
  proposalTitle: string | undefined;
  proposalTransactionId: string | undefined;
  isProposalCreationSuccessful: boolean;
}
