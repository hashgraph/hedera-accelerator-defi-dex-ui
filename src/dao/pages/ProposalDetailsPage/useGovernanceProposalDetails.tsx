import {
  useDexContext,
  useCastVote,
  useExecuteGovernanceProposal,
  useCancelProposal,
  useHandleTransactionSuccess,
  useFetchLockedGovToken,
} from "@dex/hooks";
import {
  useDAOs,
  ProposalStatus,
  useGovernanceDAOProposals,
  useChangeAdmin,
  ProposalType,
  TokenAssociateProposalDetails,
  GOVUpgradeProposalDetails,
} from "@dao/hooks";
import { GovernanceDAODetails, NFTDAODetails } from "@dao/services";
import { isNotNil } from "ramda";
import { TransactionResponse, ContractId } from "@hashgraph/sdk";

export function useGovernanceProposalDetails(daoAccountId: string, proposalId: string | undefined) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const castVote = useCastVote(proposalId, handleVoteForProposalSuccess);
  const cancelProposal = useCancelProposal(proposalId);
  const executeProposal = useExecuteGovernanceProposal(proposalId, handleExecuteProposalSuccess);
  const changeAdminMutation = useChangeAdmin(handleExecuteProposalSuccess);
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const daosQueryResults = useDAOs<GovernanceDAODetails | NFTDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao: GovernanceDAODetails | NFTDAODetails) => dao.accountId === daoAccountId);
  const daoProposalsQueryResults = useGovernanceDAOProposals(daoAccountId, dao?.tokenId, dao?.governors);
  const { data: proposals } = daoProposalsQueryResults;
  const proposal = proposals?.find((proposal) => proposal.proposalId === proposalId);
  const isDataFetched =
    daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess && isNotNil(dao) && isNotNil(proposal);

  const hasVoted = proposal?.hasVoted ?? false;
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";
  const fetchLockGODTokens = useFetchLockedGovToken(walletId, dao?.tokenHolderAddress ?? "");

  const votingPower = `${(fetchLockGODTokens.data ?? 0).toFixed(4)}`;
  const areVoteButtonsVisible = !hasVoted && proposal?.status === ProposalStatus.Pending;
  const isAuthor = walletId === proposal?.author;
  const governorUpgrade = dao?.governors?.contractUpgradeLogic;
  const governorUpgradeContractId = isNotNil(governorUpgrade)
    ? ContractId.fromSolidityAddress(governorUpgrade).toString()
    : "";

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

  function getProposalSubDescription() {
    switch (proposal?.type) {
      case ProposalType.TokenAssociate:
        return `Proposal to Associate token: ${(proposal?.data as TokenAssociateProposalDetails).tokenToAssociate}`;
      case ProposalType.UpgradeContract: {
        const upgradeData = proposal?.data as GOVUpgradeProposalDetails;
        return `Proposed to upgrade DAO from ${upgradeData?.currentLogic} to ${upgradeData?.proxyLogic}`;
      }
      default:
        return "";
    }
  }

  const subDescription = getProposalSubDescription();

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
    changeAdminMutation,
    votingPower,
    areVoteButtonsVisible,
    isAuthor,
    subDescription,
    governorUpgradeContractId,
    contractUpgradeLogic: governorUpgrade,
    isSuccess: daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess,
    isLoading: daosQueryResults.isLoading || daoProposalsQueryResults.isLoading,
    isError: daosQueryResults.isError || daoProposalsQueryResults.isError,
    error: daosQueryResults.error || daoProposalsQueryResults.error,
  };
}
