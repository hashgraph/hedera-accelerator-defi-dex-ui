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
import { Color, LoadingDialog } from "@dex-ui-components";
import { WarningIcon } from "@chakra-ui/icons";

function ProposalDetailsPage() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "", transactionHash = "" } = useParams();
  const {
    proposalDetails,
    isSuccess,
    isLoading: isLoadingProposalDetails,
    isError: isErrorFetchingProposalDetails,
    error,
    refetch,
  } = useProposalDetails(daoAccountId, transactionHash);
  const approveProposalMutation = useApproveProposal(handleApproveProposalSuccess);
  const executeProposalMutation = useExecuteProposal(handleExecuteProposalSuccess);
  const handleTransactionSuccess = useHandleTransactionSuccess();

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

  if (isErrorFetchingProposalDetails) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoadingProposalDetails) {
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
    } = proposalDetails;

    const isMultiSigProposal = daoType === DAOType.MultiSig;
    const isThresholdReached = approvalCount >= threshold;
    const memberCount = ownerIds.length;

    /** TODO: Update contracts to support a "queued" status. */
    const proposalStatus = status === ProposalStatus.Pending && isThresholdReached ? ProposalStatus.Queued : status;

    return (
      <>
        <Grid layerStyle="proposal-details__page" templateColumns="repeat(4, 1fr)">
          <GridItem colSpan={3}>
            <Flex direction="column" gap="8">
              <ProposalDetailsHeader daoAccountId={daoAccountId} title={type} />
              <ProposalDetailsStepper
                status={proposalStatus}
                isThresholdReached={isThresholdReached}
                isExecutionProcessing={executeProposalMutation.isLoading}
                hasExecutionFailed={executeProposalMutation.isError}
              />
              <ProposalDetails
                description={["Description", "-"]}
                amount={amount}
                receiver={receiver}
                tokenId={token?.data.token_id ?? "-"}
                tokenSymbol={token?.data.symbol ?? "-"}
                tokenDecimals={token?.data.decimals ?? "-"}
                event={event}
                type={type}
                approvers={approvers}
                approvalCount={approvalCount}
                transactionHash={transactionHash}
              />
            </Flex>
          </GridItem>
          <GridItem colSpan={1}>
            {isMultiSigProposal ? (
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
        <LoadingDialog
          isOpen={approveProposalMutation.isLoading || executeProposalMutation.isLoading}
          message={`Please confirm the proposal ${
            approveProposalMutation.isLoading ? "confirmation" : "execution"
          } in your wallet to proceed.`}
          onClose={refetch}
        />
        <LoadingDialog
          isOpen={approveProposalMutation.isError || executeProposalMutation.isError}
          message={
            approveProposalMutation.isError
              ? `Proposal confirmation has failed with error: ${approveProposalMutation.error?.message}`
              : `Proposal execution has failed with error: ${executeProposalMutation.error?.message}`
          }
          icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
          buttonConfig={{
            text: "Dismiss",
            onClick: () => {
              approveProposalMutation.reset();
              executeProposalMutation.reset();
              refetch();
            },
          }}
        />
      </>
    );
  }

  return <></>;
}

export { ProposalDetailsPage };
