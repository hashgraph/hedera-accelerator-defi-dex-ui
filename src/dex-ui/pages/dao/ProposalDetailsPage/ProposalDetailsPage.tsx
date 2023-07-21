import { useNavigate, useParams } from "react-router-dom";
import { ProposalConfirmationDetails } from "./ProposalConfirmationDetails";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalDetailsStepper } from "./ProposalDetailsStepper";
import { ProposalVoteDetails } from "./ProposalVoteDetails";
import { TransactionResponse } from "@hashgraph/sdk";
import { useExecuteProposal, ProposalStatus, useApproveProposal, useHandleTransactionSuccess } from "@hooks";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@layouts";
import { Grid, GridItem, Flex } from "@chakra-ui/react";
import { DAOType } from "@services";
import { isNil, isNotNil } from "ramda";
import { Paths } from "@routes";
import { useProposalDetails } from "./useProposalDetails";

export function ProposalDetailsPage() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "", transactionHash = "" } = useParams();
  const { proposalDetails, isSuccess, isLoading, isError, error } = useProposalDetails(daoAccountId, transactionHash);
  const approveProposalMutation = useApproveProposal(handleApproveProposalSuccess);
  const executeProposalMutation = useExecuteProposal(handleExecuteProposalSuccess);
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const { isLoading: isProposalBeingExecuted, isError: hasProposalExecutionFailed } = executeProposalMutation;

  function handleApproveProposalSuccess(transactionResponse: TransactionResponse) {
    approveProposalMutation.reset();
    const message = "Proposal has been confirmed.";
    handleTransactionSuccess(transactionResponse, message);
  }

  function handleExecuteProposalSuccess(transactionResponse: TransactionResponse) {
    executeProposalMutation.reset();
    const message = "Proposal has been executed.";
    handleTransactionSuccess(transactionResponse, message);
  }

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
      description,
      approvers,
      approvalCount,
      transactionHash,
      amount,
      safeId,
      receiver,
      token,
      event,
      status,
      type,
      hexStringData,
      msgValue,
      operation,
      nonce,
      daoType,
      threshold,
      ownerIds,
      author,
      title,
      tokenToAssociate,
    } = proposalDetails;

    const isMultiSigProposal = daoType === DAOType.MultiSig;
    const isThresholdReached = approvalCount >= threshold;
    const memberCount = ownerIds.length;
    /** TODO: Update contracts to support a "queued" status. */
    const proposalStatus = status === ProposalStatus.Pending && isThresholdReached ? ProposalStatus.Queued : status;

    /** TODO: Update the UI after the Design is Ready */
    const descriptionArray = isNil(tokenToAssociate)
      ? [description]
      : [description, `Associate Token: ${tokenToAssociate}`];
    return (
      <Grid layerStyle="proposal-details__page" templateColumns="repeat(4, 1fr)">
        <GridItem colSpan={3}>
          <Flex direction="column" gap="8">
            <ProposalDetailsHeader daoAccountId={daoAccountId} title={title} daoType={daoType} author={author} />
            <ProposalDetailsStepper
              status={proposalStatus}
              isThresholdReached={isThresholdReached}
              isExecutionProcessing={isProposalBeingExecuted}
              hasExecutionFailed={hasProposalExecutionFailed}
            />
            <ProposalDetails
              description={descriptionArray}
              amount={amount}
              receiver={receiver}
              tokenId={token?.data.token_id ?? "-"}
              tokenSymbol={token?.data.symbol ?? "-"}
              tokenDecimals={+(token?.data.decimals ?? 0)}
              event={event}
              type={type}
              approvers={approvers}
              approvalCount={approvalCount}
              transactionHash={transactionHash ?? ""}
            />
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          {isMultiSigProposal && transactionHash ? (
            <ProposalConfirmationDetails
              safeId={safeId}
              approvalCount={approvalCount}
              approvers={approvers}
              memberCount={memberCount}
              threshold={threshold}
              status={proposalStatus}
              transactionHash={transactionHash}
              hexStringData={hexStringData}
              msgValue={msgValue}
              operation={operation}
              nonce={nonce}
              approveProposalMutation={approveProposalMutation}
              executeProposalMutation={executeProposalMutation}
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
