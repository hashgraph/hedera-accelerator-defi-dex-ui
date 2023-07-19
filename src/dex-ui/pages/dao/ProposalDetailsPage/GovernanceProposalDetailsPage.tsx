import { useNavigate, useParams } from "react-router-dom";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalDetailsStepper } from "./ProposalDetailsStepper";
import { ProposalVoteDetails } from "./ProposalVoteDetails";
import { ProposalStatus } from "@hooks";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@layouts";
import { Grid, GridItem, Flex } from "@chakra-ui/react";
import { DAOType } from "@services";
import { isNil, isNotNil } from "ramda";
import { Paths } from "@routes";
import { useGovernanceProposalDetails } from "./useGovernanceProposalDetails";
import { GovernanceProposalConfirmationDetails } from "./GovernanceProposalConfirmationDetails";

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
  } = useGovernanceProposalDetails(daoAccountId, proposalId);
  const { isLoading: isProposalBeingExecuted, isError: hasProposalExecutionFailed } = executeProposal;

  function onBackToDAODashboardLinkClick() {
    navigate(Paths.DAOs.absolute);
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
      isQuorumReached,
    } = proposalDetails;

    const isGovernanceProposal = daoType === DAOType.GovernanceToken;

    /** TODO: Update contracts to support a "queued" status. */
    const proposalStatus = status === ProposalStatus.Pending && isQuorumReached ? ProposalStatus.Queued : status;

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
            <ProposalDetailsStepper
              status={proposalStatus}
              isThresholdReached={isQuorumReached ?? false}
              isExecutionProcessing={isProposalBeingExecuted}
              hasExecutionFailed={hasProposalExecutionFailed}
            />
            <ProposalDetails
              description={[proposalDetails.description]}
              amount={amount}
              receiver={receiver}
              tokenId={token?.data.token_id ?? "-"}
              tokenSymbol={token?.data.symbol ?? "-"}
              tokenDecimals={+(token?.data.decimals ?? 0)}
              event={event}
              type={type}
            />
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          {isGovernanceProposal ? (
            <GovernanceProposalConfirmationDetails
              tokenSymbol={token?.data.symbol ?? ""}
              proposal={proposalDetails}
              hasConnectedWalletVoted={hasVoted}
              status={proposalStatus}
              hexStringData={hexStringData}
              msgValue={msgValue}
              operation={operation}
              nonce={nonce}
              votingPower={votingPower}
              castVote={castVote}
              executeProposal={executeProposal}
              cancelProposal={cancelProposal}
            />
          ) : (
            <ProposalVoteDetails />
          )}
        </GridItem>
      </Grid>
    );
  }

  return <></>;
}
