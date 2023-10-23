import { useNavigate, useParams } from "react-router-dom";
import { ProposalConfirmationDetails } from "./ProposalConfirmationDetails";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalDetailsHeader } from "./ProposalDetailsHeader";
import { ProposalDetailsStepper } from "./ProposalDetailsStepper";
import { ProposalVoteDetails } from "./ProposalVoteDetails";
import { TransactionResponse } from "@hashgraph/sdk";
import { useHandleTransactionSuccess } from "@dex/hooks";
import {
  useExecuteProposal,
  useApproveProposal,
  useChangeAdmin,
  DAOUpgradeProposal,
  useTransferOwnership,
} from "@dao/hooks";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@dex/layouts";
import { Grid, GridItem, Flex, Button } from "@chakra-ui/react";
import { DAOType } from "@dao/services";
import { isEmpty, isNil, isNotNil } from "ramda";
import { Routes } from "@dao/routes";
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
  const transferOwnershipMutation = useTransferOwnership(handleTransferOwnershipSuccess);
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

  function handleTransferOwnershipSuccess(transactionResponse: TransactionResponse) {
    transferOwnershipMutation.reset();
    const message = "Ownership has been transferred";
    handleTransactionSuccess(transactionResponse, message);
  }

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
      description,
      approvers,
      approvalCount,
      transactionHash,
      amount,
      safeEVMAddress,
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
      metadata,
      author,
      title,
      link,
      isContractUpgradeProposal,
      data,
      showTransferOwnerShip,
      currentOwner,
      targetId,
      feeConfigControllerUser,
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
              metadata={metadata}
              amount={amount}
              receiver={receiver}
              tokenId={token?.data.token_id ?? "-"}
              tokenSymbol={token?.data.symbol ?? "-"}
              tokenDecimals={+(token?.data.decimals ?? 0)}
              tokenType={token?.data.type ?? ""}
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
                safeEVMAddress={safeEVMAddress}
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
                targetId={targetId}
                approveProposalMutation={approveProposalMutation}
                executeProposalMutation={executeProposalMutation}
                isContractUpgradeProposal={isContractUpgradeProposal}
                changeAdminMutation={changeAdminMutation}
                proxyAddress={proxyId}
                proxyAdmin={proxyAdmin}
                showTransferOwnerShip={showTransferOwnerShip}
                currentOwner={currentOwner}
                feeConfigControllerUser={feeConfigControllerUser}
                transferOwnershipMutation={transferOwnershipMutation}
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
