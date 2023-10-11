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
  useFetchLockedNFTToken,
  useChangeAdmin,
  useFetchContract,
} from "@dao/hooks";
import { DAOType, GovernanceDAODetails, NFTDAODetails } from "@dao/services";
import { isNotNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";
import { getProposalData } from "../utils";

export function useGovernanceProposalDetails(daoAccountId: string, proposalId: string | undefined) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const castVote = useCastVote(proposalId, handleVoteForProposalSuccess);
  const cancelProposal = useCancelProposal(proposalId);
  const executeProposal = useExecuteGovernanceProposal(proposalId, handleExecuteProposalSuccess);
  const changeAdminMutation = useChangeAdmin(handleExecuteProposalSuccess);
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const daoAccountIdQueryResults = useFetchContract(daoAccountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs<GovernanceDAODetails | NFTDAODetails>();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find(
    (dao: GovernanceDAODetails | NFTDAODetails) =>
      dao.accountEVMAddress.toLowerCase() == daoAccountEVMAddress?.toLowerCase()
  );
  const daoProposalsQueryResults = useGovernanceDAOProposals(
    daoAccountId,
    dao?.tokenId,
    dao?.governorAddress,
    dao?.assetsHolderAddress
  );
  const { data: proposals } = daoProposalsQueryResults;
  const proposal = proposals?.find((proposal) => proposal.proposalId === proposalId);
  const isDataFetched =
    daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess && isNotNil(dao) && isNotNil(proposal);

  const hasVoted = proposal?.hasVoted ?? false;
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";
  const fetchLockGODTokens = useFetchLockedGovToken(walletId, dao?.tokenHolderAddress ?? "");
  const lockedNFTToken = useFetchLockedNFTToken(walletId, dao?.tokenHolderAddress ?? "");

  const votingPower =
    dao?.type === DAOType.GovernanceToken
      ? `${(fetchLockGODTokens.data ?? 0).toFixed(4)}`
      : `${(Number(lockedNFTToken.data) ? 1 : 0).toFixed(4)}`;
  const areVoteButtonsVisible = !hasVoted && proposal?.status === ProposalStatus.Pending;
  const isAuthor = walletId === proposal?.author;
  const assetHolderContractId = useFetchContract(dao?.assetsHolderAddress ?? "").data?.data.contract_id;

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
  const subDescription = isNotNil(proposal) ? getProposalData(proposal) : "";
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
    assetHolderContractId,
    contractUpgradeLogic: dao?.assetsHolderAddress,
    isSuccess: daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess,
    isLoading: daosQueryResults.isLoading || daoProposalsQueryResults.isLoading,
    isError: daosQueryResults.isError || daoProposalsQueryResults.isError,
    error: daosQueryResults.error || daoProposalsQueryResults.error,
  };
}
