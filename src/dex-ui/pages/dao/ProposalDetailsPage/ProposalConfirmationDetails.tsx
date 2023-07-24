import { Box, Text, Flex, Button } from "@chakra-ui/react";
import { Tag, Color, ProgressBar, PeopleIcon, MetricLabel, CheckCircleUnfilledIcon } from "@dex-ui-components";
import { ProposalStatusAsTagVariant } from "../constants";
import {
  ProposalStatus,
  UseApproveProposalMutationResult,
  UseExecuteProposalMutationResult,
  useDexContext,
} from "@hooks";

interface ProposalConfirmationDetailsProps {
  safeAccountId: string;
  to: string;
  approvalCount: number;
  approvers: string[];
  memberCount: number;
  threshold: number;
  status: ProposalStatus;
  transactionHash: string;
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
  approveProposalMutation: UseApproveProposalMutationResult;
  executeProposalMutation: UseExecuteProposalMutationResult;
}

export function ProposalConfirmationDetails(props: ProposalConfirmationDetailsProps) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const connectedWalletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const {
    safeAccountId,
    to,
    approvalCount,
    approvers,
    threshold,
    memberCount,
    status,
    transactionHash,
    msgValue,
    hexStringData,
    operation,
    nonce,
    approveProposalMutation,
    executeProposalMutation,
  } = props;

  const confirmationProgress = approvalCount > 0 ? (approvalCount / threshold) * 100 : 0;
  const notConfirmedCount = memberCount - (approvalCount ?? 0);
  const hasConnectedWalletVoted = approvers.includes(connectedWalletId);

  /*
   * TODO: Added loading modals and states for proposal approval and execution.
   * const { isLoading: isProposalBeingApproved, isError: hasProposalApprovalFailed } = approveTransactionMutation;
   * const { isLoading: isProposalBeingExecuted, isError: hasProposalExecutionFailed } = executeTransactionMutation;
   */

  async function handleClickConfirmProposal(safeId: string, transactionHash: string) {
    approveProposalMutation.mutate({ safeId, transactionHash });
  }

  interface HandleClickExecuteTransactionParams {
    safeAccountId: string;
    to: string;
    msgValue: number;
    hexStringData: string;
    operation: number;
    nonce: number;
  }

  async function handleClickExecuteTransaction(params: HandleClickExecuteTransactionParams) {
    const { safeAccountId, to, msgValue, hexStringData, operation, nonce } = params;
    executeProposalMutation.mutate({ safeAccountId, to, msgValue, hexStringData, operation, nonce });
  }

  const ConfirmationDetailsButtons: Readonly<{ [key in ProposalStatus]: JSX.Element }> = {
    [ProposalStatus.Pending]: hasConnectedWalletVoted ? (
      <Button isDisabled leftIcon={<CheckCircleUnfilledIcon boxSize={4} />}>
        Confirmed by you
      </Button>
    ) : (
      <Button variant="primary" onClick={() => handleClickConfirmProposal(safeAccountId, transactionHash)}>
        Confirm
      </Button>
    ),
    [ProposalStatus.Queued]: (
      <Button
        variant="primary"
        onClick={() =>
          handleClickExecuteTransaction({
            safeAccountId,
            to,
            msgValue,
            hexStringData,
            operation,
            nonce,
          })
        }
      >
        Execute
      </Button>
    ),
    [ProposalStatus.Success]: <></>,
    [ProposalStatus.Failed]: <></>,
  };

  return (
    <Flex layerStyle="content-box" direction="column" height="100%">
      <Flex direction="column" gap="8" minWidth="250px" height="100%">
        <Flex justifyContent="space-between" gap="1">
          <Text textStyle="h5 medium">Confirmation details</Text>
          <Tag variant={ProposalStatusAsTagVariant[status]} />
        </Flex>
        <Flex direction="column" bg={Color.Grey_Blue._50} borderRadius="4px" padding="1rem" gap="4">
          <Flex direction="row" alignItems="center" gap="4">
            <ProgressBar
              width="100%"
              height="8px"
              borderRadius="4px"
              value={confirmationProgress}
              progressBarColor={Color.Grey_Blue._300}
            />
            <Flex direction="row" alignItems="center" gap="2">
              <Text textStyle="p small semibold">{`${approvalCount}/${threshold}`}</Text>
              <PeopleIcon boxSize={3.5} />
            </Flex>
          </Flex>
          <Flex direction="row" justifyContent="space-between" gap="4">
            <MetricLabel
              labelLeftIcon={<Box bg={Color.Grey_Blue._300} width="0.75rem" height="0.75rem" />}
              label="Confirmed"
              value={approvalCount ?? ""}
              valueStyle="p small semibold"
              valueUnitSymbol={<PeopleIcon boxSize={3.5} stroke={Color.Neutral._400} />}
            />
            <MetricLabel
              labelLeftIcon={<Box bg={Color.Neutral._200} width="0.75rem" height="0.75rem" />}
              label="Not Confirmed"
              value={notConfirmedCount}
              valueStyle="p small semibold"
              valueUnitSymbol={<PeopleIcon boxSize={3.5} stroke={Color.Neutral._400} />}
            />
          </Flex>
        </Flex>
        {ConfirmationDetailsButtons[status]}
      </Flex>
    </Flex>
  );
}
