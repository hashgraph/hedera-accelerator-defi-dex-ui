import { GOVERNOR_PROXY_CONTRACT } from "./../../services/constants";
import { BigNumber } from "bignumber.js";
import { AccountId, ContractId } from "@hashgraph/sdk";
import { HederaService, WalletService, MirrorNodeService, MirrorNodeDecodedProposalEvent } from "../../services";
import { getErrorMessage } from "../../utils";
import { TransactionStatus } from "../appSlice";
import {
  ContractProposalState,
  GovernanceActionType,
  GovernanceSlice,
  GovernanceState,
  GovernanceStore,
  Proposal,
  ProposalState,
  ProposalStatus,
} from "./type";
import { getStatus } from "./utils";
import { isNil } from "ramda";

const TOTAL_GOD_TOKEN_SUPPLY = BigNumber(100);

/** TODO: Replace will real data */
const mockProposalData: Proposal[] = [
  {
    id: BigNumber(0),
    title: "New Token Proposal 8",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: BigNumber(86400),
    state: ProposalState.Active,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 1",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: BigNumber(16400),
    state: ProposalState.Active,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 2",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: BigNumber(66400),
    state: ProposalState.Active,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 5",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: BigNumber(166400),
    state: ProposalState.Active,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 6",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Passed,
    timeRemaining: new BigNumber(0),
    state: ProposalState.Executed,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 9",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Passed,
    timeRemaining: new BigNumber(0),
    state: ProposalState.Executed,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 3",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
    adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Failed,
    timeRemaining: new BigNumber(0),
    state: ProposalState.Defeated,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 4",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Failed,
    timeRemaining: new BigNumber(0),
    state: ProposalState.Defeated,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
  {
    id: BigNumber(0),
    title: "New Token Proposal 7",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
        adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Failed,
    timeRemaining: new BigNumber(0),
    state: ProposalState.Defeated,
    votes: {
      yes: new BigNumber(12),
      no: new BigNumber(2),
      abstain: new BigNumber(30),
      quorum: new BigNumber(15),
      max: TOTAL_GOD_TOKEN_SUPPLY,
    },
  },
];

const initialGovernanceStore: GovernanceState = {
  proposals: [],
  errorMessage: null,
  proposalTransacationState: {
    status: TransactionStatus.INIT,
    successPayload: {
      transactionResponse: null,
    },
    errorMessage: "",
  },
};

/**
 *
 * @returns
 */
const createGovernanceSlice: GovernanceSlice = (set, get): GovernanceStore => {
  return {
    ...initialGovernanceStore,
    castVote: async (proposalId: string, voteType: number) => {
      const { walletData } = get().wallet;
      const { network } = get().context;
      set(
        ({ governance }) => {
          governance.proposalTransacationState = initialGovernanceStore.proposalTransacationState;
        },
        false,
        GovernanceActionType.SEND_VOTE_STARTED
      );
      const signingAccount = walletData.pairedAccounts[0];
      const provider = WalletService.getProvider(network, walletData.topicID, signingAccount);
      const signer = WalletService.getSigner(provider);
      try {
        set(
          ({ governance }) => {
            governance.proposalTransacationState.status = TransactionStatus.IN_PROGRESS;
          },
          false,
          GovernanceActionType.SIGN_TRANSACTION
        );
        const response = await HederaService.castVote({ proposalId, voteType, signer });
        if (response) {
          set(
            ({ governance }) => {
              governance.proposalTransacationState.status = TransactionStatus.SUCCESS;
              governance.proposalTransacationState.successPayload.transactionResponse = response;
            },
            false,
            GovernanceActionType.SEND_VOTE_SUCCEEDED
          );
        } else {
          throw new Error("Transaction Execution Failed");
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ governance }) => {
            governance.proposalTransacationState.status = TransactionStatus.ERROR;
            governance.proposalTransacationState.errorMessage = errorMessage;
          },
          false,
          GovernanceActionType.SEND_VOTE_FAILED
        );
      }
    },
    fetchProposal: (proposalId: string) => {
      const { governance } = get();
      return governance.proposals.find((proposal: Proposal) => BigNumber(proposalId).eq(proposal.id));
    },
    fetchProposals: async () => {
      const { app } = get();
      app.setFeaturesAsLoading(["proposals"]);
      set({}, false, GovernanceActionType.FETCH_PROPOSALS_STARTED);
      try {
        const proposalEvents = await MirrorNodeService.fetchAllProposals(GOVERNOR_PROXY_CONTRACT.StringId);
        const getTimeRemaining = (startBlock: BigNumber, endBlock: BigNumber): BigNumber => {
          /** Each Blocktime is about 12 secs long */
          const duration = BigNumber(endBlock).minus(BigNumber(startBlock)).times(12);
          return duration;
        };
        const proposals = await Promise.allSettled(
          proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent): Promise<Proposal> => {
            const { proposalId, description, proposer, startBlock, endBlock } = proposalEvent;
            const state = await HederaService.fetchProposalState(proposalId);
            const votes = await HederaService.fetchProposalVotes(proposalId);
            const quorum = endBlock ? await HederaService.fetchQuorum(endBlock) : undefined;
            const proposalState = state
              ? (ContractProposalState[state?.toNumber()] as keyof typeof ContractProposalState)
              : undefined;
            return {
              id: proposalId,
              title: description,
              description: `Preview of the description lorem ipsum dolor sit amit consectetur 
            adipiscing elit Phasellus congue, sapien eu...`,
              author: proposer ? AccountId.fromSolidityAddress(proposer) : AccountId.fromString("0.0.34728121"),
              status: proposalState ? getStatus(ProposalState[proposalState]) : undefined,
              timeRemaining:
                !isNil(startBlock) && !isNil(endBlock) ? getTimeRemaining(startBlock, endBlock) : undefined,
              state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
              votes: {
                yes: votes.forVotes,
                no: votes.againstVotes,
                abstain: votes.abstainVotes,
                quorum,
                max: TOTAL_GOD_TOKEN_SUPPLY,
              },
            };
          })
        );
        const fulfilledProposals = proposals.reduce((p: any, proposal: any): Proposal[] => {
          if (proposal.status === "fulfilled") return [...p, proposal.value];
          return p;
        }, []);
        set(
          ({ governance }) => {
            governance.proposals = fulfilledProposals;
          },
          false,
          GovernanceActionType.FETCH_PROPOSALS_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ governance }) => {
            governance.errorMessage = errorMessage;
          },
          false,
          GovernanceActionType.FETCH_PROPOSALS_FAILED
        );
      }
      app.setFeaturesAsLoaded(["proposals"]);
    },
    sendCreateNewTokenProposalTransaction: async ({ title }) => {
      const { context, wallet } = get();
      const { walletData } = wallet;
      const { network } = context;
      set(
        ({ governance }) => {
          governance.proposalTransacationState = {
            ...initialGovernanceStore.proposalTransacationState,
            status: TransactionStatus.IN_PROGRESS,
          };
          governance.errorMessage = initialGovernanceStore.errorMessage;
        },
        false,
        GovernanceActionType.SEND_CREATE_NEW_TOKEN_PROPOSAL_STARTED
      );
      const provider = WalletService.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const signer = WalletService.getSigner(provider);
      /**
       * All data except for the proposal title is mocked for now. The proposal execution
       * logic should be computed on the Hedera network in a Smart Contract - not on the front-end.
       * */
      const mockContractAddress = ContractId.fromString("0.0.48585457").toSolidityAddress();
      const targets = [mockContractAddress];
      const fees = [0];
      const associateToken = new Uint8Array([255]);
      const calls = [associateToken];
      try {
        const result = await HederaService.createProposal({
          targets,
          fees,
          calls,
          description: title,
          signer,
        });
        if (result !== undefined) {
          set(
            ({ governance }) => {
              governance.proposalTransacationState = {
                status: TransactionStatus.SUCCESS,
                successPayload: {
                  proposal: { title },
                  transactionResponse: result,
                },
                errorMessage: "",
              };
              governance.errorMessage = initialGovernanceStore.errorMessage;
              governance.proposals = mockProposalData;
            },
            false,
            GovernanceActionType.SEND_CREATE_NEW_TOKEN_PROPOSAL_SUCCEEDED
          );
        } else {
          throw new Error(`Create new proposal execution failed`);
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ governance }) => {
            governance.proposalTransacationState = {
              status: TransactionStatus.ERROR,
              successPayload: initialGovernanceStore.proposalTransacationState.successPayload,
              errorMessage: errorMessage,
            };
            governance.errorMessage = errorMessage;
          },
          false,
          GovernanceActionType.SEND_CREATE_NEW_TOKEN_PROPOSAL_FAILED
        );
      }
    },
    clearProposalTransactionState: () => {
      set(
        ({ governance }) => {
          governance.proposalTransacationState = initialGovernanceStore.proposalTransacationState;
          governance.errorMessage = initialGovernanceStore.errorMessage;
        },
        false,
        GovernanceActionType.CLEAR_PROPOSAL_TRANSACTION_STATE
      );
    },
  };
};

export { createGovernanceSlice };
