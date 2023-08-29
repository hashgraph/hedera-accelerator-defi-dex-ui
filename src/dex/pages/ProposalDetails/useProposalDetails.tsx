import {
  useDexContext,
  useCastVote,
  useExecuteGovernanceProposal,
  useProposal,
  useCancelProposal,
  useFetchLockedGovToken,
} from "@dex/hooks";
import { ProposalState, ProposalStatus, ProposalStates, ProposalStateIcon } from "../../store/governanceSlice";
import { createHashScanAccountIdLink, createHashScanTransactionLink, getStatusColor } from "@dex/utils";
import { Contracts } from "@dex/services";

export function useProposalDetails(proposalId: string | undefined) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";
  const proposal = useProposal(proposalId);
  const castVote = useCastVote(proposalId);
  const cancelProposal = useCancelProposal(proposalId);
  const hasVoted = proposal.data?.voted ?? false;
  const executeProposal = useExecuteGovernanceProposal(proposalId);
  const { data: lockedGODToken = 0 } = useFetchLockedGovToken(walletId, Contracts.GODHolder.ProxyId);

  const areButtonsHidden = proposal.isLoading || castVote.isLoading || proposal.data?.status === ProposalStatus.Failed;
  const isHasVotedMessageVisible = hasVoted && proposal.data?.status === ProposalStatus.Active;
  const areVoteButtonsVisible = !hasVoted && proposal.data?.status === ProposalStatus.Active;
  const isExecuteButtonVisible =
    proposal.data?.status === ProposalStatus.Passed && proposal.data?.state !== ProposalState.Executed;
  const isCancelButtonVisible =
    proposal.data?.state !== ProposalState.Executed && proposal.data?.state !== ProposalState.Canceled;
  const isClaimTokenButtonVisible = proposal.data?.state === ProposalState.Executed;
  const statusColor = getStatusColor(proposal.data?.status, proposal.data?.state);

  const isLoadingDialogOpen = executeProposal.isLoading || castVote.isLoading || cancelProposal.isLoading;

  const isWalletConnected = wallet.isPaired();
  const doesUserHaveGodTokens = wallet.doesUserHaveGODTokensToVote();
  const votingPower = `${lockedGODToken.toFixed(4)}`;

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
  const hashScanAccountLink = createHashScanAccountIdLink(walletId);

  function getProposalStatus(): ProposalStates[] | undefined {
    switch (proposal.data?.state) {
      case ProposalState.Pending:
      case ProposalState.Active:
        return [
          { status: "Review", iconType: ProposalStateIcon.Completed },
          {
            status: "Active",
            iconType: ProposalStateIcon.Active,
            timeRemaining: proposal.data.timeRemaining?.toString(),
          },
          { status: "Queued To Execute", iconType: ProposalStateIcon.Disabled },
          { status: "Executed", iconType: ProposalStateIcon.Disabled },
        ];
      case ProposalState.Succeeded:
      case ProposalState.Queued:
        return [
          { status: "Review", iconType: ProposalStateIcon.Completed },
          { status: "Active", iconType: ProposalStateIcon.Completed },
          { status: "Queued To Execute", iconType: ProposalStateIcon.Active },
          { status: "Executed", iconType: ProposalStateIcon.Disabled },
        ];

      case ProposalState.Executed:
        return [
          { status: "Review", iconType: ProposalStateIcon.Completed },
          { status: "Active", iconType: ProposalStateIcon.Completed },
          { status: "Queued To Execute", iconType: ProposalStateIcon.Completed },
          { status: "Executed", iconType: ProposalStateIcon.Completed },
        ];
      case ProposalState.Canceled:
        return [
          { status: "Review", iconType: ProposalStateIcon.Completed },
          { status: "Cancelled", iconType: ProposalStateIcon.Cancelled },
        ];

      case ProposalState.Defeated:
      case ProposalState.Expired:
        return [
          { status: "Review", iconType: ProposalStateIcon.Completed },
          { status: "Active", iconType: ProposalStateIcon.Completed },
          { status: "Defeated", iconType: ProposalStateIcon.Cancelled },
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
    isCancelButtonVisible,
    votingPower,
  };
}
