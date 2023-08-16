import { useNavigate, useParams } from "react-router-dom";
import { ProposalConfirmationDetails } from "./ProposalConfirmationDetails";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalDetailsStepper } from "./ProposalDetailsStepper";
import { ProposalVoteDetails } from "./ProposalVoteDetails";
import { TransactionResponse } from "@hashgraph/sdk";
import {
  useExecuteProposal,
  useApproveProposal,
  useHandleTransactionSuccess,
  useChangeAdmin,
  DAOUpgradeProposal,
} from "@hooks";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@layouts";
import { Grid, GridItem, Flex, Button } from "@chakra-ui/react";
import { DAOType } from "@services";
import { isEmpty, isNil, isNotNil } from "ramda";
import { Paths } from "@routes";
import { useProposalDetails } from "./useProposalDetails";
import { getProposalData } from "../utils";

export function ProposalDetailsPage() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "", transactionHash = "" } = useParams();
  const { proposalDetails, isSuccess, isLoading, isError, error } = useProposalDetails(daoAccountId, transactionHash);
  const approveProposalMutation = useApproveProposal(handleApproveProposalSuccess);
  const executeProposalMutation = useExecuteProposal(handleExecuteProposalSuccess);
  const changeAdminMutation = useChangeAdmin(handleExecuteProposalSuccess);
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

  function onViewDiscussionLinkTap() {
    if (isNotNil(proposalDetails?.link)) {
      window.open(proposalDetails?.link);
    }
  }

  if (isSuccess && isNotNil(proposalDetails)) {
    const {
      description,
      approvers,
      approvalCount,
      transactionHash,
      amount,
      safeAccountId,
      to,
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
      link,
      isContractUpgradeProposal,
      data,
    } = proposalDetails;

    const isMultiSigProposal = daoType === DAOType.MultiSig;
    const memberCount = ownerIds.length;
    const proxyId = (data as DAOUpgradeProposal)?.proxy ?? "";
    const proxyAdmin = (data as DAOUpgradeProposal)?.proxyAdmin ?? "";
    const descriptionArray = [description, getProposalData(proposalDetails)];

    return (
      <Grid layerStyle="proposal-details__page" templateColumns="repeat(4, 1fr)">
        <GridItem colSpan={3}>
          <Flex direction="column" gap="8">
            <ProposalDetailsHeader daoAccountId={daoAccountId} title={title} daoType={daoType} author={author} />
            <ProposalDetailsStepper
              status={status}
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
          <Flex gap="1rem" width="100%" direction="column" height="100%">
            {isNotNil(link) && !isEmpty(link) ? (
              <Button variant="secondary" onClick={onViewDiscussionLinkTap}>
                View Discussion
              </Button>
            ) : undefined}
            {isMultiSigProposal && transactionHash ? (
              <ProposalConfirmationDetails
                safeAccountId={safeAccountId}
                to={to}
                approvalCount={approvalCount}
                approvers={approvers}
                memberCount={memberCount}
                threshold={threshold}
                status={status}
                transactionHash={transactionHash}
                hexStringData={hexStringData}
                msgValue={msgValue}
                operation={operation}
                nonce={nonce}
                approveProposalMutation={approveProposalMutation}
                executeProposalMutation={executeProposalMutation}
                isContractUpgradeProposal={isContractUpgradeProposal}
                changeAdminMutation={changeAdminMutation}
                proxyAddress={proxyId}
                proxyAdmin={proxyAdmin}
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
