import { useNavigate, useParams } from "react-router-dom";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalDetailsStepper } from "./ProposalDetailsStepper";
import { ProposalVoteDetails } from "./ProposalVoteDetails";
import { ProposalEvent, ProposalStatus, ProposalType } from "@hooks";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@layouts";
import { Grid, GridItem, Flex } from "@chakra-ui/react";
import { DAOType } from "@services";
import { isNil, isNotNil } from "ramda";
import { Paths } from "@routes";
import { Color, LoadingDialog } from "@dex-ui-components";
import { WarningIcon } from "@chakra-ui/icons";
import { useGovernanceTokenProposalDetails } from "./useProposalDetails";
import { formatProposal } from "@dex-ui/pages/Governance/formatter";
import { ProposalState } from "@dex-ui/store/governanceSlice";

export function GovernanceTokenProposalDetailsPage() {
  const navigate = useNavigate();
  const { /* accountId: daoAccountId = "",  */ id: proposalId = "" } = useParams();
  const governanceTokenPropsalDetails = useGovernanceTokenProposalDetails(/* daoAccountId,  */ proposalId);
  const { proposalDetails } = governanceTokenPropsalDetails;
  const {
    /*     dao,
  daosQueryResults, */
    proposal: proposalQueryResults,
    castVote: castVoteMutation,
    cancelProposal: cancelProposalMutation,
    executeProposal: executeProposalMutation,
    hasVoted,
    isNotificationVisible,
    successMessage,
    hashScanTransactionLink,
    hashScanAccountLink,
    isLoadingDialogOpen,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    proposalStatus,
  } = proposalDetails;
  const proposal = proposalQueryResults.data;

  function onBackToDAODashboardLinkClick() {
    navigate(Paths.DAOs.absolute);
  }

  function resetServerState() {
    castVoteMutation.reset();
    executeProposalMutation.reset();
    cancelProposalMutation.reset();
  }

  if (/* daosQueryResults.isError || */ proposalQueryResults.isError) {
    return <ErrorLayout message={/* daosQueryResults.error?.message ||  */ proposalQueryResults.error?.message} />;
  }

  if (/* daosQueryResults.isLoading ||  */ proposalQueryResults.isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (
    /* daosQueryResults.isSuccess && */ proposalQueryResults.isSuccess &&
    /* (isNil(dao) ||  */ isNil(proposal) /* ) */
  ) {
    return (
      <NotFound
        message={`We didn't find any data for this proposal.`}
        preLinkText={""}
        linkText={"Click here to return to the DAO dashboard page."}
        onLinkClick={onBackToDAODashboardLinkClick}
      />
    );
  }

  if (
    /* daosQueryResults.isSuccess &&  */ proposalQueryResults.isSuccess /*  && isNotNil(dao) */ &&
    isNotNil(proposal)
  ) {
    const formattedProposal = formatProposal(proposal);
    const { id, author, type, title, description, timeRemaining, state, votes, timestamp } = formattedProposal;

    const ProposalStateToStatus: Readonly<Record<ProposalState, ProposalStatus>> = {
      [ProposalState.Pending]: ProposalStatus.Pending,
      [ProposalState.Active]: ProposalStatus.Pending,
      [ProposalState.Canceled]: ProposalStatus.Failed,
      [ProposalState.Defeated]: ProposalStatus.Failed,
      [ProposalState.Succeeded]: ProposalStatus.Success,
      [ProposalState.Queued]: ProposalStatus.Queued,
      [ProposalState.Expired]: ProposalStatus.Failed,
      [ProposalState.Executed]: ProposalStatus.Success,
    };

    const status = state !== undefined ? ProposalStateToStatus[state] : ProposalStatus.Pending;

    return (
      <>
        <Grid layerStyle="proposal-details__page" templateColumns="repeat(4, 1fr)">
          <GridItem colSpan={3}>
            <Flex direction="column" gap="8">
              <ProposalDetailsHeader
                daoAccountId={"9.sd"}
                title={title ?? ""}
                author={author}
                type={DAOType.GovernanceToken}
              />
              <ProposalDetailsStepper
                status={status}
                isThresholdReached={status === ProposalStatus.Success || status === ProposalStatus.Queued}
                isExecutionProcessing={executeProposalMutation.isLoading}
                hasExecutionFailed={executeProposalMutation.isError}
              />
              <ProposalDetails
                description={[description]}
                amount={10}
                receiver={"0.3.434"}
                tokenId={"0.3.434"}
                tokenSymbol={"SDS"}
                tokenDecimals={"9"}
                event={ProposalEvent.Send}
                type={ProposalType.TokenTransfer}
                transactionHash={proposalId}
                created={timestamp ?? "-"}
              />
            </Flex>
          </GridItem>
          <GridItem colSpan={1}>
            <ProposalVoteDetails
              proposalDetails={proposalDetails}
              resetServerState={resetServerState}
              status={status}
            />
          </GridItem>
        </Grid>
        <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
        <LoadingDialog
          isOpen={isErrorDialogOpen}
          message={errorDialogMessage}
          icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
          buttonConfig={{
            text: "Dismiss",
            onClick: () => {
              resetServerState();
            },
          }}
        />
      </>
    );
  }

  return <></>;
}
