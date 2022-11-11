import { AccountId, ContractId } from "@hashgraph/sdk";
import { HederaService, WalletService } from "../../services";
import { getErrorMessage } from "../../utils";
import { GovernanceActionType, GovernanceSlice, GovernanceState, GovernanceStore, Proposal } from "./type";

/** TODO: Replace will real data */
const mockProposalData: Proposal[] = [
  {
    title: "New Token Proposal 1",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Active",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 2",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Active",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 5",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Active",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 3",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
    adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Passed",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 4",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Failed",
    timeRemaining: "6d 4 hrs",
    voteCount: {
      yes: 232,
      no: 212,
      abstain: 2203,
    },
  },
];

const initialGovernanceStore: GovernanceState = {
  proposals: [],
  errorMessage: null,
  proposalTransacationState: {
    status: "init",
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
        set(
          ({ governance }) => {
            governance.proposals = mockProposalData;
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
            status: "in progress",
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
                status: "success",
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
              status: "error",
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
