import { HederaService } from "../../services";
import { getErrorMessage } from "../../utils";
import { TransactionStatus } from "../appSlice";
import {
  GovernanceActionType,
  GovernanceSlice,
  GovernanceState,
  GovernanceStore,
  CreateProposalData,
  CreateTransferTokenProposalData,
  ProposalType,
  CreateTextProposalData,
} from "./type";

const initialGovernanceStore: GovernanceState = {
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
            const createTextProposal = data as CreateTextProposalData;
            return HederaService.sendCreateTextProposalTransaction(
              createTextProposal.title,
              createTextProposal.description,
              createTextProposal.linkToDiscussion,
              signer
            );
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
              title: createTransferTokenProposalData.title,
              description: createTransferTokenProposalData.description,
              linkToDiscussion: createTransferTokenProposalData.linkToDiscussion,
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
  };
};

export { createGovernanceSlice };
