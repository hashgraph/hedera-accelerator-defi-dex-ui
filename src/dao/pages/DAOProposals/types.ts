import { TokenBalance } from "@dex/hooks";
import { UploadedFile } from "@shared/ui-kit";
import { AbiInternalType, AbiParameter } from "abitype";

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
  Generic = "Generic",
}

export interface CreateDAOProposalFormBase {
  title: string;
  description: string;
  type: DAOProposalType;
}

export interface CreateDAOTextProposalForm extends CreateDAOProposalFormBase {
  linkToDiscussion: string;
  nftTokenSerialId: number;
  metadata: string;
}

export interface CreateDAOTokenTransferForm extends CreateDAOProposalFormBase {
  recipientAccountId: string;
  linkToDiscussion: string;
  tokenType: string;
  tokenId: string;
  amount: string | undefined;
  decimals: number;
  nftSerialId: number;
  governanceNftTokenSerialId: number;
}

export interface CreateDAOTokenAssociateForm extends CreateDAOProposalFormBase {
  tokenId: string;
  linkToDiscussion: string;
  nftTokenSerialId: number;
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
  proxyAdmin: string;
  nftTokenSerialId?: number;
}

type ResolvedAbiType = string;

export type Argument = StandardArgument | TupleArgument;

export type StandardArgument = {
  type: ResolvedAbiType;
  transformedValue: any | undefined;
} & BaseArgumentFields;

export type TupleArgument = {
  type: "tuple" | `tuple[${string}]`;
  components: readonly Argument[];
} & BaseArgumentFields;

type BaseArgumentFields = {
  name?: string | undefined;
  internalType?: AbiInternalType | undefined;
  inputValue: string;
  transformedValue: any | undefined;
};

export type AbiTupleParameter = {
  type: "tuple" | `tuple[${string}]`;
  name?: string | undefined;
  internalType?: AbiInternalType | undefined;
  inputValue: string;
  components: readonly AbiParameter[];
};

export interface CreateDAOGenericProposalForm extends CreateDAOProposalFormBase {
  linkToDiscussion: string;
  targetContractId: string;
  abiFile: UploadedFile;
  functionName: string;
  functionArguments: Argument[];
  encodedFunctionData: string;
}

export type CreateDAOProposalForm =
  | CreateDAOTextProposalForm
  | CreateDAOTokenTransferForm
  | CreateDAOMemberOperationForm
  | CreateDAOUpgradeThresholdForm
  | CreateDAOContractUpgradeForm
  | CreateDAOTokenAssociateForm
  | CreateDAOGenericProposalForm;

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
