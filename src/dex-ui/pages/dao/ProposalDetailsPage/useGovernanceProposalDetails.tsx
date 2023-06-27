import {
  useDexContext,
  useCastVote,
  useExecuteGovernanceProposal,
  useCancelProposal,
  useDAOs,
  ProposalStatus,
  useHandleTransactionSuccess,
  useGovernanceDAOProposals,
  useFetchDAOLockedGovToken,
} from "@hooks";
import { GovernanceDAODetails } from "@services";
import { isNotNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";

export function useGovernanceProposalDetails(daoAccountId: string, proposalId: string | undefined) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const castVote = useCastVote(proposalId, handleVoteForProposalSuccess);
  const cancelProposal = useCancelProposal(proposalId);
  const executeProposal = useExecuteGovernanceProposal(proposalId, handleExecuteProposalSuccess);
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const daosQueryResults = useDAOs<GovernanceDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao: GovernanceDAODetails) => dao.accountId === daoAccountId);
  const daoProposalsQueryResults = useGovernanceDAOProposals(daoAccountId, dao?.tokenId, dao?.governors);
  const { data: proposals } = daoProposalsQueryResults;
  const proposal = proposals?.find((proposal) => proposal.proposalId === proposalId);
  const isDataFetched =
    daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess && isNotNil(dao) && isNotNil(proposal);

  const hasVoted = proposal?.hasVoted ?? false;
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";
  const fetchLockGODTokens = useFetchDAOLockedGovToken(dao?.tokenHolderAddress ?? "", walletId);

  const votingPower = `${(fetchLockGODTokens.data ?? 0).toFixed(4)}`;
  const areVoteButtonsVisible = !hasVoted && proposal?.status === ProposalStatus.Pending;

  function handleVoteForProposalSuccess(transactionResponse: TransactionResponse) {
    castVote.reset();
    const message = "Vote has been casted.";
    handleTransactionSuccess(transactionResponse, message);
  }

  function handleExecuteProposalSuccess(transactionResponse: TransactionResponse) {
    executeProposal.reset();
    const message = "Proposal has been executed.";
    handleTransactionSuccess(transactionResponse, message);
  }

  return {
    proposalDetails: isDataFetched
      ? {
          ...proposal,
          daoType: dao?.type,
          dao: dao,
        }
      : undefined,
    castVote,
    cancelProposal,
    hasVoted,
    executeProposal,
    votingPower,
    areVoteButtonsVisible,
    isSuccess: daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess,
    isLoading: daosQueryResults.isLoading || daoProposalsQueryResults.isLoading,
    isError: daosQueryResults.isError || daoProposalsQueryResults.isError,
    error: daosQueryResults.error || daoProposalsQueryResults.error,
  };
}
