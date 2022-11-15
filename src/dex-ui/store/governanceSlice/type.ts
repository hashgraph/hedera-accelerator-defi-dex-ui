import { BigNumber } from "bignumber.js";
import { TransactionResponse, AccountId } from "@hashgraph/sdk";
import { StateCreator } from "zustand";
import { DEXState } from "..";
import { TransactionStatus } from "../appSlice";

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
  id: BigNumber;
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

enum GovernanceActionType {
  FETCH_PROPOSALS_STARTED = "governance/FETCH_PROPOSALS_STARTED",
  FETCH_PROPOSALS_SUCCEEDED = "governance/FETCH_PROPOSALS_SUCCEEDED",
  FETCH_PROPOSALS_FAILED = "governance/FETCH_PROPOSALS_FAILED",
  SEND_CREATE_NEW_TOKEN_PROPOSAL_STARTED = "governance/SEND_CREATE_NEW_TOKEN_PROPOSAL_STARTED",
  SEND_CREATE_NEW_TOKEN_PROPOSAL_SUCCEEDED = "governance/SEND_CREATE_NEW_TOKEN_PROPOSAL_SUCCEEDED",
  SEND_CREATE_NEW_TOKEN_PROPOSAL_FAILED = "governance/SEND_CREATE_NEW_TOKEN_PROPOSAL_FAILED",
  SEND_VOTE_STARTED = "governance/SEND_VOTE_STARTED",
  SEND_VOTE_SUCCEEDED = "governance/SEND_VOTE_SUCCEEDED",
  SEND_VOTE_FAILED = "governance/SEND_VOTE_FAILED",
  SIGN_TRANSACTION = "governance/SIGN_TRANSACTION",
  CLEAR_PROPOSAL_TRANSACTION_STATE = "governance/CLEAR_PROPOSAL_TRANSACTION_STATE",
}

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
  proposals: Array<Proposal>;
  errorMessage: string | null;
  proposalTransacationState: ProposalTransacationState;
}

interface sendCreateNewTokenProposalParams {
  title: string;
}
interface GovernanceActions {
  castVote: (proposalId: string, voteType: number) => Promise<void>;
  fetchProposal: (proposalId: string) => Proposal | undefined;
  fetchProposals: () => Promise<void>;
  sendCreateNewTokenProposalTransaction: ({ title }: sendCreateNewTokenProposalParams) => Promise<void>;
  clearProposalTransactionState: () => void;
}

type GovernanceStore = GovernanceState & GovernanceActions;

type GovernanceSlice = StateCreator<
  DEXState,
  [["zustand/devtools", never], ["zustand/immer", never]],
  [],
  GovernanceStore
>;

export { GovernanceActionType, ContractProposalState, ProposalState, ProposalStatus };
export type { GovernanceSlice, GovernanceStore, GovernanceState, GovernanceActions, Proposal };
