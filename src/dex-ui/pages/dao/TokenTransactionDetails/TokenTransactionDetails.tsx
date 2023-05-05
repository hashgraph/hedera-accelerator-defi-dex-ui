import { Text, Flex, Divider, Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  Color,
  HashScanLink,
  HashscanData,
  MetricLabel,
  ProgressBar,
  Button,
  PeopleIcon,
  Breadcrumb,
  ArrowLeftIcon,
} from "@dex-ui-components";
import { ErrorLayout, LoadingSpinnerLayout, ProposalDetailsLayout } from "@layouts";
import { useDAOTransactions, useDAOs, useApproveTransaction, useExecuteTransaction } from "@hooks";
import { MultiSigDAODetails } from "@services";
import { isNotNil } from "ramda";
import { formatTokenAmountWithDecimal } from "@utils";
import { Link as ReachLink } from "react-router-dom";

export function TokenTransactionDetails() {
  const { accountId: daoAccountId = "", transactionHash = "" } = useParams();
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao: MultiSigDAODetails) => dao.accountId === daoAccountId);
  const daoTransactionsQueryResults = useDAOTransactions(daoAccountId, dao?.safeId ?? "");
  const { isSuccess, isLoading, isError, error, data: transactions } = daoTransactionsQueryResults;
  const transaction = transactions?.find((transaction) => transaction.transactionHash === transactionHash);
  const approveTransactionMutation = useApproveTransaction();
  const executeTransactionMutation = useExecuteTransaction();

  async function handleClickConfirmTransaction(safeId: string, transactionHash: string) {
    approveTransactionMutation.mutate({ safeId, transactionHash });
  }

  interface HandleClickExecuteTransactionParams {
    safeId: string;
    to: string;
    value: number;
    hexStringData: string;
    operation: number;
    nonce: number;
  }

  async function handleClickExecuteTransaction(params: HandleClickExecuteTransactionParams) {
    const { safeId, to, value, hexStringData, operation, nonce } = params;
    executeTransactionMutation.mutate({ safeId, to, value, hexStringData, operation, nonce });
  }

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess && isNotNil(dao) && isNotNil(transaction)) {
    const { safeId, threshold, ownerIds } = dao;
    const {
      approvers,
      approvalCount,
      transactionHash,
      amount,
      to,
      token,
      event,
      status,
      type,
      hexData,
      operation,
      nonce,
    } = transaction;
    const amountDisplay = formatTokenAmountWithDecimal(amount, Number(token?.data.decimals));
    const confirmationProgress = approvalCount > 0 ? (approvalCount / threshold) * 100 : 0;
    const memberCount = ownerIds.length;
    const notConfirmedCount = memberCount - (approvalCount ?? 0);
    const isThresholdReached = approvalCount >= threshold;

    return (
      <ProposalDetailsLayout
        title={type}
        status={status}
        rightNavigationComponent={
          <Breadcrumb
            to={`/daos/multisig/${daoAccountId}/transactions`}
            as={ReachLink}
            label={"Back to Transactions"}
            leftIcon={<ArrowLeftIcon options={{ w: 3, h: 3 }} />}
          />
        }
        details={
          <Flex direction="column" gap="4" width="100%">
            <Flex direction="row" gap="16">
              <MetricLabel label={event} value={`${amountDisplay} ${token?.data.symbol}`} />
              <MetricLabel label={"To"} value={<HashScanLink id={to} type={HashscanData.Account} />} />
            </Flex>
            <Divider />
            <MetricLabel
              label={"Voted on"}
              value={
                <>
                  {approvers.map((approver) => (
                    <HashScanLink id={approver} type={HashscanData.Account} />
                  ))}
                </>
              }
            />
            <Divider />
            <MetricLabel label={"Transaction Hash"} value={transactionHash} />
          </Flex>
        }
        rightPanel={
          <Flex direction="column" gap="8" minWidth="250px">
            <Text textStyle="h5 medium">Confirmation details</Text>
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
                  <PeopleIcon options={{ width: "14px", height: "12px" }} />
                </Flex>
              </Flex>
              <Flex direction="row" justifyContent="space-between" gap="4">
                <MetricLabel
                  labelLeftIcon={<Box bg={Color.Grey_Blue._300} width="0.75rem" height="0.75rem" />}
                  label="Confirmed"
                  value={approvalCount ?? ""}
                  valueStyle="p small semibold"
                  valueUnitSymbol={
                    <PeopleIcon options={{ width: "14px", height: "12px" }} stroke={Color.Neutral._400} />
                  }
                />
                <MetricLabel
                  labelLeftIcon={<Box bg={Color.Neutral._200} width="0.75rem" height="0.75rem" />}
                  label="Not Confirmed"
                  value={notConfirmedCount}
                  valueStyle="p small semibold"
                  valueUnitSymbol={
                    <PeopleIcon options={{ width: "14px", height: "12px" }} stroke={Color.Neutral._400} />
                  }
                />
              </Flex>
            </Flex>
            <Flex direction="column" gap="2">
              {isThresholdReached ? (
                <Button
                  variant="primary"
                  // TODO: Fix issue with transaction execution and enable button.
                  isDisabled
                  onClick={() =>
                    handleClickExecuteTransaction({
                      safeId,
                      to,
                      value: amount,
                      hexStringData: hexData,
                      operation,
                      nonce,
                    })
                  }
                >
                  Execute (Under Development)
                </Button>
              ) : (
                <>
                  <Button variant="primary" onClick={() => handleClickConfirmTransaction(safeId, transactionHash)}>
                    Confirm
                  </Button>
                  <Button variant="secondary">Cancel Transaction</Button>
                </>
              )}
            </Flex>
          </Flex>
        }
      />
    );
  }
  return <></>;
}
