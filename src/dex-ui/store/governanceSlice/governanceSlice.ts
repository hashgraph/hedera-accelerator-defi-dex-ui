import { BigNumber } from "bignumber.js";
import { HederaService } from "../../services";
import { getErrorMessage } from "../../utils";
import { TransactionStatus } from "../appSlice";
import {
  GovernanceActionType,
  GovernanceSlice,
  GovernanceState,
  GovernanceStore,
  Proposal,
  CreateProposalData,
  CreateTransferTokenProposalData,
  ProposalType,
} from "./type";

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
              "",
              createTransferTokenProposalData.amountToTransfer,
              createTransferTokenProposalData.tokenToTransfer
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
