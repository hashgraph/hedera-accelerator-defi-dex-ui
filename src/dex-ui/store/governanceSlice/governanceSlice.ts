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

/** TODO: Replace will real data */
const mockProposalData: Proposal[] = [
  {
    title: "New Token Proposal 8",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Pending,
    voteCount: {
      yes: new BigNumber(123),
      no: new BigNumber(462),
      abstain: new BigNumber(3000),
    },
  },
  {
    title: "New Token Proposal 1",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Active,
    voteCount: {
      yes: new BigNumber(13),
      no: new BigNumber(23),
      abstain: new BigNumber(112),
    },
  },
  {
    title: "New Token Proposal 2",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Active,
    voteCount: {
      yes: new BigNumber(123),
      no: new BigNumber(462),
      abstain: new BigNumber(3000),
    },
  },
  {
    title: "New Token Proposal 5",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Active,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Queued,
    voteCount: {
      yes: new BigNumber(123),
      no: new BigNumber(462),
      abstain: new BigNumber(3000),
    },
  },
  {
    title: "New Token Proposal 6",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Passed,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Executed,
    voteCount: {
      yes: new BigNumber(123),
      no: new BigNumber(462),
      abstain: new BigNumber(3000),
    },
  },
  {
    title: "New Token Proposal 9",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Passed,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Succeeded,
    voteCount: {
      yes: new BigNumber(123),
      no: new BigNumber(462),
      abstain: new BigNumber(3000),
    },
  },
  {
    title: "New Token Proposal 3",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
    adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Failed,
    timeRemaining: "12d 4 hrs",
    state: ProposalState.Defeated,
    voteCount: {
      yes: new BigNumber(123),
      no: new BigNumber(462),
      abstain: new BigNumber(3000),
    },
  },
  {
    title: "New Token Proposal 4",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Failed,
    timeRemaining: "6d 4 hrs",
    state: ProposalState.Canceled,
    voteCount: {
      yes: new BigNumber(232),
      no: new BigNumber(212),
      abstain: new BigNumber(2203),
    },
  },
  {
    title: "New Token Proposal 7",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
        adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: ProposalStatus.Failed,
    timeRemaining: "6d 4 hrs",
    state: ProposalState.Expired,
    voteCount: {
      yes: new BigNumber(232),
      no: new BigNumber(212),
      abstain: new BigNumber(2203),
    },
  },
];

const initialGovernanceStore: GovernanceState = {
  proposals: [],
  errorMessage: null,
  proposalTransacationState: {
    status: TransactionStatus.INIT,
    successPayload: null,
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
    fetchProposals: async () => {
      const { app } = get();
      app.setFeaturesAsLoading(["proposals"]);
      set({}, false, GovernanceActionType.FETCH_PROPOSALS_STARTED);
      try {
        const proposalEvents = await MirrorNodeService.fetchAllProposals(GOVERNOR_PROXY_CONTRACT.StringId);
        const proposals = await Promise.all(
          proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent): Promise<Proposal> => {
            const { proposalId, description, proposer } = proposalEvent;
            const state = await HederaService.getProposalState(proposalId);
            const votes = await HederaService.getProposalVotes(proposalId);
            const proposalState = state
              ? (ContractProposalState[state?.toNumber()] as keyof typeof ContractProposalState)
              : undefined;
            return {
              title: description,
              description: `Preview of the description lorem ipsum dolor sit amit consectetur 
            adipiscing elit Phasellus congue, sapien eu...`,
              author: proposer ? AccountId.fromSolidityAddress(proposer) : AccountId.fromString("0.0.34728121"),
              status: getStatus(proposalState),
              timeRemaining: "12d 4 hrs", // convert to timestamp
              state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
              voteCount: {
                yes: votes.forVotes,
                no: votes.againstVotes,
                abstain: votes.abstainVotes,
              },
            };
          })
        );
        console.log(proposals.concat(mockProposalData));
        set(
          ({ governance }) => {
            governance.proposals = proposals.concat(mockProposalData);
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
              successPayload: null,
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
