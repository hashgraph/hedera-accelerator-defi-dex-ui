import { TransactionResponse, AccountId } from "@hashgraph/sdk";
import { StateCreator } from "zustand";
import { DEXState } from "..";

type VotingStatus = "Review" | "Active" | "Queued to Execute" | "Executed";
type ProposalStatus = "Active" | "Passed" | "Failed";

interface Proposal {
  title: string;
  author: AccountId;
  description: string;
  status: ProposalStatus;
  timeRemaining: string;
  voteCount: {
    yes: number;
    no: number;
    abstain: number;
  };
}

enum GovernanceActionType {
  FETCH_PROPOSALS_STARTED = "governance/FETCH_PROPOSALS_STARTED",
  FETCH_PROPOSALS_SUCCEEDED = "governance/FETCH_PROPOSALS_SUCCEEDED",
  FETCH_PROPOSALS_FAILED = "governance/FETCH_PROPOSALS_FAILED",
  SEND_CREATE_NEW_TOKEN_PROPOSAL_STARTED = "governance/SEND_CREATE_NEW_TOKEN_PROPOSAL_STARTED",
  SEND_CREATE_NEW_TOKEN_PROPOSAL_SUCCEEDED = "governance/SEND_CREATE_NEW_TOKEN_PROPOSAL_SUCCEEDED",
  SEND_CREATE_NEW_TOKEN_PROPOSAL_FAILED = "governance/SEND_CREATE_NEW_TOKEN_PROPOSAL_FAILED",
  CLEAR_PROPOSAL_TRANSACTION_STATE = "governance/CLEAR_PROPOSAL_TRANSACTION_STATE",
}

interface ProposalTransacationState {
  status: "init" | "in progress" | "success" | "error";
  successPayload: {
    proposal: {
      title: string;
    };
    transactionResponse: TransactionResponse;
  } | null;
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

export { GovernanceActionType };
export type {
  GovernanceSlice,
  GovernanceStore,
  GovernanceState,
  GovernanceActions,
  Proposal,
  VotingStatus,
  ProposalStatus,
};
