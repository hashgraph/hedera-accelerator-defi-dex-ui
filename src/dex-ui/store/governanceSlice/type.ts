import { BigNumber } from "bignumber.js";
import { TransactionResponse, AccountId } from "@hashgraph/sdk";
import { StateCreator } from "zustand";
import { DEXState } from "..";
import { TransactionStatus } from "../appSlice";

enum ProposalType {
  Text = "Text",
  TokenTransfer = "Token Transfer",
  CreateToken = "Create Token",
  ContractUpgrade = "Contract Upgrade",
}

enum ProposalStatus {
  Active = "Active",
  Passed = "Passed",
  Failed = "Failed",
}

/**
 * The current Governor contract only utilizes three states: Active, Defeated, and Executed.
 */
enum ContractProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

enum ProposalState {
  Pending = "Pending",
  Active = "Active",
  Canceled = "Canceled",
  Defeated = "Defeated",
  Succeeded = "Succeeded",
  Queued = "Queued",
  Expired = "Expired",
  Executed = "Executed",
}

interface Proposal {
  id: string;
  contractId: string;
  type: ProposalType | undefined;
  title: string | undefined;
  author: AccountId;
  description: string;
  status: ProposalStatus | undefined;
  timeRemaining: BigNumber | undefined;
  state: ProposalState | undefined;
  votes: {
    yes: BigNumber | undefined;
    no: BigNumber | undefined;
    abstain: BigNumber | undefined;
    quorum: BigNumber | undefined;
    max: BigNumber | undefined;
  };
}

enum EXECUTE_PROPOSAL {
  Started = "governance/EXECUTE_PROPOSAL_Started",
  Succeeded = "governance/EXECUTE_PROPOSAL_Succeeded",
  Failed = "governance/EXECUTE_PROPOSAL_Failed",
}

enum SEND_CREATE_PROPOSAL {
  Started = "governance/SEND_CREATE_PROPOSAL_Started",
  Succeeded = "governance/SEND_CREATE_PROPOSAL_Succeeded",
  Failed = "governance/SEND_CREATE_PROPOSALL_Failed",
}

enum SEND_VOTE {
  Started = "governance/SEND_VOTE_Started",
  Succeeded = "governance/SEND_VOTE_Succeeded",
  Failed = "governance/SEND_VOTE_Failed",
}

const GovernanceActionType = {
  EXECUTE_PROPOSAL,
  SEND_CREATE_PROPOSAL,
  SEND_VOTE,
  SIGN_TRANSACTION: "governance/SIGN_TRANSACTION",
  CLEAR_PROPOSAL_TRANSACTION_STATE: "governance/CLEAR_PROPOSAL_TRANSACTION_STATE",
};

interface ProposalTransacationState {
  status: TransactionStatus;
  successPayload: {
    proposal?: {
      title: string;
    };
    transactionResponse: TransactionResponse | null;
  };
  errorMessage: string;
}

interface GovernanceState {
  errorMessage: string | null;
  proposalTransacationState: ProposalTransacationState;
}

interface CreateNewTokenProposalData {
  title: string;
}

interface CreateTextProposalData {
  title: string;
}

interface CreateTransferTokenProposalData {
  title: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: number;
}

type CreateProposalData = CreateNewTokenProposalData | CreateTextProposalData | CreateTransferTokenProposalData;
interface GovernanceActions {
  castVote: (contractId: string, proposalId: string, voteType: number) => Promise<void>;
  createProposal: (type: ProposalType, data: CreateProposalData) => Promise<void>;
  clearProposalTransactionState: () => void;
  executeProposal: (contractId: string, title: string) => Promise<void>;
}

type GovernanceStore = GovernanceState & GovernanceActions;

type GovernanceSlice = StateCreator<
  DEXState,
  [["zustand/devtools", never], ["zustand/immer", never]],
  [],
  GovernanceStore
>;

export { GovernanceActionType, ProposalType, ContractProposalState, ProposalState, ProposalStatus };
export type {
  CreateProposalData,
  CreateTransferTokenProposalData,
  GovernanceSlice,
  GovernanceStore,
  GovernanceState,
  GovernanceActions,
  Proposal,
};
