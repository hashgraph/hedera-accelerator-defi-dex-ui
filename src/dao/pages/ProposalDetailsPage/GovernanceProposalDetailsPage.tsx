import { useNavigate, useParams } from "react-router-dom";
import { SINGLE_DAO_ID } from "@dao/config/singleDao";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalDetailsStepper } from "./ProposalDetailsStepper";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@dex/layouts";
import { Button, Flex, Grid, GridItem } from "@chakra-ui/react";
import { DAOType } from "@dao/services";
import { isEmpty, isNil, isNotNil } from "ramda";
import { Routes } from "@dao/routes";
import { useGovernanceProposalDetails } from "./useGovernanceProposalDetails";
// eslint-disable-next-line max-len
import { GovernanceProposalConfirmationDetails } from "@dao/pages/ProposalDetailsPage/GovernanceProposalConfirmationDetails";

export function GovernanceProposalDetailsPage() {
  const navigate = useNavigate();
  const { transactionHash = "" } = useParams();
  const {
    proposalDetails,
    isSuccess,
    isLoading,
    isError,
    error,
    executeProposal,
    hasVoted,
    castVote,
    cancelProposal,
    changeAdminMutation,
    votingPower,
    isAuthor,
    contractUpgradeLogic,
    assetHolderContractId,
    subDescription,
  } = useGovernanceProposalDetails(SINGLE_DAO_ID, transactionHash);

  const isProposalBeingExecuted = executeProposal?.isLoading ?? false;
  const hasProposalExecutionFailed = executeProposal?.isError ?? false;

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
    return (
      <NotFound
        message={`We didn't find any data for this proposal.`}
        preLinkText={""}
        linkText={"Click here to return to the DAO dashboard page."}
        onLinkClick={onBackToDAODashboardLinkClick}
      />
    );
  }

  function onViewDiscussionLinkTap() {
    if (isNotNil(proposalDetails?.link)) {
      window.open(proposalDetails?.link);
    }
  }

  if (isSuccess && isNotNil(proposalDetails)) {
    const {
      description,
      approvalCount,
      transactionHash,
      amount,
      token,
      event,
      status,
      type,
      metadata,
      author,
      title,
      link,
    } = proposalDetails;

    const dataObj = proposalDetails.data as Record<string, unknown> | undefined;
    const str =
      dataObj && typeof dataObj === "object"
        ? Object.entries(dataObj)
            .map(([key, value]) => `${key}=${String(value)}`)
            .join(", ")
        : "";

    const descriptionArray = [description, subDescription, str].filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0
    );

    return (
      <Grid layerStyle="proposal-details__page" templateColumns="repeat(4, 1fr)">
        <GridItem colSpan={3}>
          <Flex direction="column" gap="8">
            <ProposalDetailsHeader title={title} daoType={DAOType.GovernanceToken} author={author} />
            <ProposalDetailsStepper
              status={status}
              isExecutionProcessing={isProposalBeingExecuted}
              hasExecutionFailed={hasProposalExecutionFailed}
            />
            <ProposalDetails
              description={descriptionArray}
              metadata={metadata}
              amount={amount}
              receiver={""}
              tokenId={token?.data.token_id ?? "-"}
              tokenSymbol={(token?.data.symbol === "GOD" ? "HTK" : token?.data.symbol) ?? "-"}
              tokenDecimals={+(token?.data.decimals ?? 0)}
              tokenType={token?.data.type ?? ""}
              event={event}
              type={type}
              approvers={[]}
              approvalCount={approvalCount}
              transactionHash={transactionHash ?? ""}
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
            <GovernanceProposalConfirmationDetails
              tokenSymbol={(token?.data.symbol === "GOD" ? "HTK" : token?.data.symbol) ?? ""}
              contractUpgradeLogic={contractUpgradeLogic ?? ""}
              assetHolderContractId={assetHolderContractId ?? ""}
              proposal={proposalDetails}
              hasConnectedWalletVoted={hasVoted}
              status={status}
              state={proposalDetails.proposalState}
              hexStringData={proposalDetails.hexStringData ?? ""}
              msgValue={proposalDetails.msgValue ?? 0}
              operation={proposalDetails.operation ?? 0}
              nonce={proposalDetails.nonce ?? 0}
              votingPower={votingPower}
              castVote={castVote}
              executeProposal={executeProposal}
              changeAdminMutation={changeAdminMutation}
              cancelProposal={cancelProposal}
              isAuthor={isAuthor}
            />
          </Flex>
        </GridItem>
      </Grid>
    );
  }

  return <></>;
}
