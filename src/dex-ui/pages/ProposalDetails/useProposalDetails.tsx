import {
  useDexContext,
  useHasVoted,
  useCastVote,
  useExecuteProposal,
  useProposal,
  useClaimGODTokens,
} from "../../hooks";
import { ProposalState, ProposalStatus } from "../../store/governanceSlice";
import { createHashScanLink, getStatusColor } from "../../utils";

export function useProposalDetails(proposalId: string | undefined) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const proposal = useProposal(proposalId);
  const castVote = useCastVote();
  const hasVoted = useHasVoted(proposal.data?.contractId, proposal.data?.id, wallet.getSigner());
  const executeProposal = useExecuteProposal();
  const claimGODTokens = useClaimGODTokens();

  const areButtonsHidden = proposal.isLoading || castVote.isLoading || proposal.data?.status === ProposalStatus.Failed;
  const isHasVotedMessageVisible = hasVoted.data && proposal.data?.status === ProposalStatus.Active;
  const areVoteButtonsVisible = !hasVoted.data && proposal.data?.status === ProposalStatus.Active;
  const isExecuteButtonVisible =
    proposal.data?.status === ProposalStatus.Passed && proposal.data?.state !== ProposalState.Executed;
  const isClaimTokenButtonVisible = proposal.data?.state === ProposalState.Executed;
  const statusColor = getStatusColor(proposal.data?.status, proposal.data?.state);

  const isLoadingDialogOpen = executeProposal.isLoading || castVote.isLoading || claimGODTokens.isLoading;
  function getLoadingDialogMessage(): string {
    if (castVote.isLoading) return "Please confirm the vote in your wallet to proceed";
    if (executeProposal.isLoading) return "Please confirm the proposal execution in your wallet to proceed";
    if (claimGODTokens.isLoading) return "Please confirm the governance token claim in your wallet to proceed";
    return "";
  }
  const loadingDialogMessage = getLoadingDialogMessage();

  const isErrorDialogOpen = executeProposal.isError || castVote.isError || claimGODTokens.isError;
  function getErrorDialogMessage(): string {
    if (castVote.isError) return castVote.error?.message;
    if (executeProposal.isError) return executeProposal.error?.message;
    if (claimGODTokens.isError) return claimGODTokens.error?.message;
    return "";
  }
  const errorDialogMessage = getErrorDialogMessage();

  const isNotificationVisible = executeProposal.isSuccess || castVote.isSuccess || claimGODTokens.isSuccess;

  function getSuccessMessage(): string {
    if (castVote.isSuccess) return `Your vote has been submitted.`;
    if (executeProposal.isSuccess) return `The ${proposal.data?.title} proposal has been executed.`;
    if (claimGODTokens.isSuccess) return `GOD tokens returned to ${proposal.data?.author}.`;
    return "";
  }
  const successMessage = getSuccessMessage();

  function getHashScanLink(): string | undefined {
    if (castVote.isSuccess) {
      const castVoteTransactionId = castVote.data?.transactionId.toString();
      return createHashScanLink(castVoteTransactionId);
    }
    if (executeProposal.isSuccess) {
      const executeProposalTransactionId = executeProposal.data?.transactionId.toString();
      return createHashScanLink(executeProposalTransactionId);
    }
    if (claimGODTokens.isSuccess) {
      const claimGODTokensTransactionId = claimGODTokens.data?.transactionId.toString();
      return createHashScanLink(claimGODTokensTransactionId);
    }
  }
  const hashScanLink = getHashScanLink();

  return {
    proposal,
    castVote,
    hasVoted,
    executeProposal,
    claimGODTokens,
    isNotificationVisible,
    successMessage,
    hashScanLink,
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
  };
}
