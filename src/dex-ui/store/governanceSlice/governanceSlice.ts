import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { HederaService } from "../../services";
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
    sendCreateNewTokenProposalTransaction: async () => {
      const { context, wallet, app } = get();
      set({}, false, GovernanceActionType.SEND_CREATE_NEW_TOKEN_PROPOSAL_STARTED);
      try {
        const tokenId = TokenId.fromString("0.0.48602743");

        const BASE_CONTRACT_ADDRESS = ContractId.fromString("0.0.48585457").toSolidityAddress();
        const targets = [BASE_CONTRACT_ADDRESS];
        const fees = [0];
        const associateToken = new Uint8Array([255]); //await associateTokenPublicCallData(tokenId);
        const calls = [associateToken];
        const description = "Create token proposal 5";
        HederaService.createProposal({ targets, fees, calls, description });
        set(
          ({ governance }) => {
            governance.proposals = mockProposalData;
          },
          false,
          GovernanceActionType.SEND_CREATE_NEW_TOKEN_PROPOSAL_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ governance }) => {
            governance.errorMessage = errorMessage;
          },
          false,
          GovernanceActionType.SEND_CREATE_NEW_TOKEN_PROPOSAL_FAILED
        );
      }
    },
  };
};

export { createGovernanceSlice };
