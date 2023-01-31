import {
  useDexContext,
  useHasVoted,
  useCastVote,
  useExecuteProposal,
  useProposal,
  useCancelProposal,
} from "../../hooks";
import { ProposalState, ProposalStatus, ProposalStates } from "../../store/governanceSlice";
import { createHashScanAccountIdLink, createHashScanTransactionLink, getStatusColor } from "../../utils";

export function useProposalDetails(proposalId: string | undefined) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const proposal = useProposal(proposalId);
  const castVote = useCastVote();
  const cancelProposal = useCancelProposal();
  const hasVoted = useHasVoted(proposal.data?.contractId, proposal.data?.id, wallet.getSigner());
  const executeProposal = useExecuteProposal();

  const areButtonsHidden = proposal.isLoading || castVote.isLoading || proposal.data?.status === ProposalStatus.Failed;
  const isHasVotedMessageVisible = hasVoted.data && proposal.data?.status === ProposalStatus.Active;
  const areVoteButtonsVisible = !hasVoted.data && proposal.data?.status === ProposalStatus.Active;
  const isExecuteButtonVisible =
    proposal.data?.status === ProposalStatus.Passed && proposal.data?.state !== ProposalState.Executed;
  const isClaimTokenButtonVisible = proposal.data?.state === ProposalState.Executed;
  const statusColor = getStatusColor(proposal.data?.status, proposal.data?.state);

  const isLoadingDialogOpen = executeProposal.isLoading || castVote.isLoading || cancelProposal.isLoading;

  const isWalletConnected = wallet.isPaired();
  const doesUserHaveGodTokens = wallet.doesUserHaveGODTokensToVote();

  function getLoadingDialogMessage(): string {
    if (castVote.isLoading) return "Please confirm the vote in your wallet to proceed.";
    if (executeProposal.isLoading) return "Please confirm the proposal execution in your wallet to proceed.";
    if (cancelProposal.isLoading) return "Please confirm the proposal cancelation in your wallet to proceed.";
    return "";
  }
  const loadingDialogMessage = getLoadingDialogMessage();

  const isErrorDialogOpen = executeProposal.isError || castVote.isError || cancelProposal.isError;
  function getErrorDialogMessage(): string {
    if (castVote.isError) return castVote.error?.message;
    if (executeProposal.isError) return executeProposal.error?.message;
    if (cancelProposal.isError) return cancelProposal.error?.message;
    return "";
  }
  const errorDialogMessage = getErrorDialogMessage();

  const isNotificationVisible = executeProposal.isSuccess || castVote.isSuccess || cancelProposal.isSuccess;

  function getSuccessMessage(): string {
    if (castVote.isSuccess) return `Your vote has been submitted.`;
    if (executeProposal.isSuccess) return `The ${proposal.data?.title} proposal has been executed.`;
    if (cancelProposal.isSuccess) return `You have canceled ${proposal.data?.title}.`;
    return "";
  }
  const successMessage = getSuccessMessage();

  function getHashScanLink(): string | undefined {
    if (castVote.isSuccess) {
      const castVoteTransactionId = castVote.data?.transactionId.toString();
      return createHashScanTransactionLink(castVoteTransactionId);
    }
    if (executeProposal.isSuccess) {
      const executeProposalTransactionId = executeProposal.data?.transactionId.toString();
      return createHashScanTransactionLink(executeProposalTransactionId);
    }
    if (cancelProposal.isSuccess) {
      const cancelProposalTransactionId = cancelProposal.data?.transactionId.toString();
      return createHashScanTransactionLink(cancelProposalTransactionId);
    }
  }
  const hashScanTransactionLink = getHashScanLink();
  const hashScanAccountLink = createHashScanAccountIdLink(wallet.getSigner().getAccountId().toString());

  function getProposalStatus(): ProposalStates[] | undefined {
    switch (proposal.data?.state) {
      case "Pending":
      case "Active":
        return [
          { status: "Review", iconType: "full" },
          { status: "Active", iconType: "current", timeRemaining: proposal.data.timeRemaining },
          { status: "Queued To Execute", iconType: "half" },
          { status: "Executed", iconType: "half" },
        ];
      case "Succeeded":
      case "Queued":
        return [
          { status: "Review", iconType: "full" },
          { status: "Active", iconType: "full" },
          { status: "Queued To Execute", iconType: "current" },
          { status: "Executed", iconType: "half" },
        ];

      case "Executed":
        return [
          { status: "Review", iconType: "full" },
          { status: "Active", iconType: "full" },
          { status: "Queued To Execute", iconType: "full" },
          { status: "Executed", iconType: "full" },
        ];
      case "Canceled":
        return [
          { status: "Review", iconType: "full" },
          { status: "Cancelled", iconType: "cancel" },
        ];

      case "Defeated":
      case "Expired":
        return [
          { status: "Review", iconType: "full" },
          { status: "Active", iconType: "full" },
          { status: "Defeated", iconType: "cancel" },
        ];

      default:
        return undefined;
    }
  }
  const proposalStatus = getProposalStatus();

  return {
    proposal,
    castVote,
    cancelProposal,
    hasVoted,
    executeProposal,
    isNotificationVisible,
    successMessage,
    hashScanTransactionLink,
    hashScanAccountLink,
    areButtonsHidden,
    isHasVotedMessageVisible,
    areVoteButtonsVisible,
    isExecuteButtonVisible,
    isClaimTokenButtonVisible,
    statusColor,
    isLoadingDialogOpen,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    isWalletConnected,
    doesUserHaveGodTokens,
    proposalStatus,
  };
}
