import { useNavigate, useParams } from "react-router-dom";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalVoteDetails } from "./ProposalVoteDetails";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@dex/layouts";
import { Grid, GridItem, Flex, Button } from "@chakra-ui/react";
import { DAOType } from "@dao/services";
import { isNil, isNotNil, isEmpty } from "ramda";
import { Routes } from "@dao/routes";
import { useGovernanceProposalDetails } from "./useGovernanceProposalDetails";
import { GovernanceProposalConfirmationDetails } from "./GovernanceProposalConfirmationDetails";
import { GovernanceProposalDetailsStepper } from "./GovernanceProposalDetailsStepper";

export function GovernanceProposalDetailsPage() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "", proposalId = "" } = useParams();
  const {
    proposalDetails,
    isSuccess,
    isLoading,
    isError,
    error,
    castVote,
    cancelProposal,
    executeProposal,
    votingPower,
    hasVoted,
    changeAdminMutation,
    contractUpgradeLogic,
    assetHolderContractId,
    subDescription,
    isAuthor,
  } = useGovernanceProposalDetails(daoAccountId, proposalId);

  const { isLoading: isProposalBeingExecuted, isError: hasProposalExecutionFailed } = executeProposal;

  function onBackToDAODashboardLinkClick() {
    navigate(Routes.Home);
  }

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess && isNil(proposalDetails)) {
    <NotFound
      message={`We didn't find any data for this proposal.`}
      preLinkText={""}
      linkText={"Click here to return to the DAO dashboard page."}
      onLinkClick={onBackToDAODashboardLinkClick}
    />;
  }

  function onViewDiscussionLinkTap() {
    if (isNotNil(proposalDetails?.link)) {
      window.open(proposalDetails?.link);
    }
  }

  if (isSuccess && isNotNil(proposalDetails)) {
    const {
      amount,
      receiver,
      token,
      event,
      status,
      type,
      author,
      hexStringData,
      msgValue,
      operation,
      nonce,
      daoType,
      proposalState,
      link,
    } = proposalDetails;

    const isGovernanceProposal = daoType === DAOType.GovernanceToken;
    const isNFTProposal = daoType === DAOType.NFT;

    /** TODO: Update contracts to support a "queued" status. */
    const proposalStatus = status;

    return (
      <Grid layerStyle="proposal-details__page" templateColumns="repeat(4, 1fr)">
        <GridItem colSpan={3}>
          <Flex direction="column" gap="8">
            <ProposalDetailsHeader
              daoAccountId={daoAccountId}
              title={proposalDetails.title}
              daoType={daoType}
              author={author}
            />
            <GovernanceProposalDetailsStepper
              state={proposalState}
              isExecutionProcessing={isProposalBeingExecuted}
              hasExecutionFailed={hasProposalExecutionFailed}
            />
            <ProposalDetails
              description={[proposalDetails.description, subDescription]}
              metadata={proposalDetails.metadata}
              amount={amount}
              receiver={receiver}
              tokenId={token?.data.token_id ?? "-"}
              tokenSymbol={token?.data.symbol ?? "-"}
              tokenDecimals={+(token?.data.decimals ?? 0)}
              tokenType={token?.data.type ?? ""}
              event={event}
              type={type}
            />
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex gap="1rem" width="100%" direction="column" height="100%">
            {isNotNil(link) && !isEmpty(link) ? (
              <Button variant="secondary" onClick={onViewDiscussionLinkTap}>
                View Discussion
              </Button>
            ) : undefined}
            {isGovernanceProposal || isNFTProposal ? (
              <GovernanceProposalConfirmationDetails
                tokenSymbol={""}
                contractUpgradeLogic={contractUpgradeLogic ?? ""}
                assetHolderContractId={assetHolderContractId ?? ""}
                proposal={proposalDetails}
                hasConnectedWalletVoted={hasVoted}
                status={proposalStatus}
                state={proposalState}
                hexStringData={hexStringData}
                msgValue={msgValue}
                operation={operation}
                nonce={nonce}
                votingPower={votingPower}
                castVote={castVote}
                executeProposal={executeProposal}
                changeAdminMutation={changeAdminMutation}
                cancelProposal={cancelProposal}
                isAuthor={isAuthor}
              />
            ) : (
              <ProposalVoteDetails />
            )}
          </Flex>
        </GridItem>
      </Grid>
    );
  }

  return <></>;
}
