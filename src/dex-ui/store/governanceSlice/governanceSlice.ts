import { GovernorProxyContracts } from "./../../services/constants";
import { BigNumber } from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { HederaService, MirrorNodeService, MirrorNodeDecodedProposalEvent } from "../../services";
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
  CreateProposalData,
  CreateTransferTokenProposalData,
  ProposalType,
} from "./type";
import { getStatus } from "./utils";
import { isNil } from "ramda";

const TOTAL_GOD_TOKEN_SUPPLY = BigNumber(100);

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
    castVote: async (contractId: string, proposalId: string, voteType: number) => {
      const { wallet } = get();
      set(
        ({ governance }) => {
          governance.proposalTransacationState = initialGovernanceStore.proposalTransacationState;
        },
        false,
        GovernanceActionType.SEND_VOTE.Started
      );
      const signer = wallet.getSigner();
      try {
        set(
          ({ governance }) => {
            governance.proposalTransacationState.status = TransactionStatus.IN_PROGRESS;
          },
          false,
          GovernanceActionType.SIGN_TRANSACTION
        );
        const response = await HederaService.castVote({ contractId, proposalId, voteType, signer });
        if (response) {
          set(
            ({ governance }) => {
              governance.proposalTransacationState.status = TransactionStatus.SUCCESS;
              governance.proposalTransacationState.successPayload.transactionResponse = response;
            },
            false,
            GovernanceActionType.SEND_VOTE.Succeeded
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
          GovernanceActionType.SEND_VOTE.Failed
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
      set({}, false, GovernanceActionType.FETCH_PROPOSALS.Started);
      /** TODO: Refactor and move fetchProposal logic into service layer and utils files. */
      try {
        const tokenTransferEventsResult = MirrorNodeService.fetchAllProposals(
          ProposalType.TokenTransfer,
          GovernorProxyContracts.TransferTokenStringId
        );
        const createTokenEventsResult = MirrorNodeService.fetchAllProposals(
          ProposalType.CreateToken,
          GovernorProxyContracts.CreateTokenStringId
        );
        const textProposalEventsResult = MirrorNodeService.fetchAllProposals(
          ProposalType.Text,
          GovernorProxyContracts.TextProposalStringId
        );
        const contractUpgradeEventsResult = MirrorNodeService.fetchAllProposals(
          ProposalType.ContractUpgrade,
          GovernorProxyContracts.ContractUpgradeStringId
        );

        const proposalEventsResults = await Promise.allSettled([
          tokenTransferEventsResult,
          createTokenEventsResult,
          textProposalEventsResult,
          contractUpgradeEventsResult,
        ]);

        const proposalEvents = proposalEventsResults.reduce(
          (
            proposalEvents: MirrorNodeDecodedProposalEvent[],
            proposalEventResult: PromiseSettledResult<MirrorNodeDecodedProposalEvent[]>
          ): MirrorNodeDecodedProposalEvent[] => {
            if (proposalEventResult.status === "fulfilled") return [...proposalEvents, ...proposalEventResult.value];
            return proposalEvents;
          },
          []
        );

        const getTimeRemaining = (startBlock: string, endBlock: string): BigNumber => {
          /** Each Blocktime is about 12 secs long */
          const duration = BigNumber(endBlock).minus(BigNumber(startBlock)).times(12);
          return duration;
        };

        const proposalDetailsResults = await Promise.allSettled(
          proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent): Promise<Proposal> => {
            const { proposalId, contractId, type, description, proposer, startBlock, endBlock } = proposalEvent;
            try {
              const stateResult = HederaService.fetchProposalState(contractId, proposalId);
              const votesResult = HederaService.fetchProposalVotes(contractId, proposalId);
              const quorumResult = endBlock ? HederaService.fetchQuorum(contractId, endBlock) : undefined;
              const events = await Promise.allSettled([stateResult, votesResult, quorumResult]);
              const [state, votes, quorum] = events.map((event: any) => {
                return event.value ? event.value : undefined;
              });
              const proposalState = state
                ? (ContractProposalState[state?.toNumber()] as keyof typeof ContractProposalState)
                : undefined;
              console.log([state, votes, quorum], proposalState);
              const isProposalTypeValid = Object.values(ProposalType).includes(type as ProposalType);
              return {
                id: proposalId,
                contractId,
                type: isProposalTypeValid ? (type as ProposalType) : undefined,
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
            } catch (error) {
              const errorMessage = getErrorMessage(error);
              throw Error(errorMessage);
            }
          })
        );

        const proposals = proposalDetailsResults.reduce(
          (proposals: Proposal[], proposalResult: PromiseSettledResult<Proposal>): Proposal[] => {
            console.log(proposalResult);
            if (proposalResult.status === "fulfilled") return [...proposals, proposalResult.value];
            return proposals;
          },
          []
        );
        set(
          ({ governance }) => {
            governance.proposals = proposals;
          },
          false,
          GovernanceActionType.FETCH_PROPOSALS.Succeeded
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ governance }) => {
            governance.errorMessage = errorMessage;
          },
          false,
          GovernanceActionType.FETCH_PROPOSALS.Failed
        );
      }
      app.setFeaturesAsLoaded(["proposals"]);
    },
    createProposal: async (type: ProposalType, data: CreateProposalData) => {
      const { wallet } = get();
      set(
        ({ governance }) => {
          governance.proposalTransacationState = {
            ...initialGovernanceStore.proposalTransacationState,
            status: TransactionStatus.IN_PROGRESS,
          };
          governance.errorMessage = initialGovernanceStore.errorMessage;
        },
        false,
        GovernanceActionType.SEND_CREATE_PROPOSAL.Started
      );
      const signer = wallet.getSigner();
      try {
        const getResult = async () => {
          if (type === ProposalType.Text) {
            return HederaService.sendCreateTextProposalTransaction(data.title, signer);
          }
          if (type === ProposalType.TokenTransfer) {
            const createTransferTokenProposalData = data as CreateTransferTokenProposalData;
            const preciseTransferTokenAmount = wallet.getTokenAmountWithPrecision(
              // TODO: This is a temporary override to use token id instead of symbol
              createTransferTokenProposalData.tokenToTransfer,
              createTransferTokenProposalData.amountToTransfer
            );
            return HederaService.sendCreateTransferTokenProposalTransaction({
              description: data.title,
              accountToTransferTo: createTransferTokenProposalData.accountToTransferTo,
              tokenToTransfer: createTransferTokenProposalData.tokenToTransfer,
              amountToTransfer: preciseTransferTokenAmount,
              signer,
            });
          }
        };
        const result = await getResult();
        if (result !== undefined) {
          set(
            ({ governance }) => {
              governance.proposalTransacationState = {
                status: TransactionStatus.SUCCESS,
                successPayload: {
                  proposal: { title: data.title },
                  transactionResponse: result,
                },
                errorMessage: "",
              };
              governance.errorMessage = initialGovernanceStore.errorMessage;
            },
            false,
            GovernanceActionType.SEND_CREATE_PROPOSAL.Succeeded
          );
        } else {
          throw new Error(`Create proposal failed`);
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
          GovernanceActionType.SEND_CREATE_PROPOSAL.Failed
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
    executeProposal: async (contractId: string, title: string) => {
      const { wallet } = get();
      set(
        ({ governance }) => {
          governance.proposalTransacationState = {
            ...initialGovernanceStore.proposalTransacationState,
            status: TransactionStatus.IN_PROGRESS,
          };
          governance.errorMessage = initialGovernanceStore.errorMessage;
        },
        false,
        GovernanceActionType.EXECUTE_PROPOSAL.Started
      );
      const signer = wallet.getSigner();

      try {
        const result = await HederaService.executeProposal({ contractId, description: title, signer });

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
            },
            false,
            GovernanceActionType.EXECUTE_PROPOSAL.Succeeded
          );
        } else {
          throw new Error(`Execute proposal failed`);
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
          GovernanceActionType.EXECUTE_PROPOSAL.Failed
        );
      }
    },
  };
};

export { createGovernanceSlice };
