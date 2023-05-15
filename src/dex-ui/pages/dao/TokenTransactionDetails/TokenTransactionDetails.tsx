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
  Tag,
  CheckCircleUnfilledIcon,
} from "@dex-ui-components";
import { ErrorLayout, LoadingSpinnerLayout, ProposalDetailsLayout } from "@layouts";
import {
  useDAOTransactions,
  useDAOs,
  useApproveTransaction,
  useExecuteTransaction,
  TransactionStatus,
  useDexContext,
} from "@hooks";
import { MultiSigDAODetails } from "@services";
import { isNotNil } from "ramda";
import { formatTokenAmountWithDecimal } from "@utils";
import { Link as ReachLink } from "react-router-dom";
import { TransactionStatusAsTagVariant } from "../constants";

export function TokenTransactionDetails() {
  const { accountId: daoAccountId = "", transactionHash = "" } = useParams();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const connectedWalletId = wallet.savedPairingData?.accountIds[0] ?? "";
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
    msgValue: number;
    hexStringData: string;
    operation: number;
    nonce: number;
  }

  async function handleClickExecuteTransaction(params: HandleClickExecuteTransactionParams) {
    const { safeId, msgValue, hexStringData, operation, nonce } = params;
    executeTransactionMutation.mutate({ safeId, msgValue, hexStringData, operation, nonce });
  }

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess && isNotNil(dao) && isNotNil(transaction)) {
    const { threshold, ownerIds } = dao;
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
    } = transaction;
    const amountDisplay = formatTokenAmountWithDecimal(amount, Number(token?.data.decimals));
    const confirmationProgress = approvalCount > 0 ? (approvalCount / threshold) * 100 : 0;
    const memberCount = ownerIds.length;
    const notConfirmedCount = memberCount - (approvalCount ?? 0);
    const isThresholdReached = approvalCount >= threshold;
    const hasConnectedWalletVoted = approvers.includes(connectedWalletId);
    /** TODO: Update contracts to support a "queued" status. */
    const transactionStatus =
      status === TransactionStatus.Pending && isThresholdReached ? TransactionStatus.Queued : status;

    const ApproversList =
      approvalCount === 0 ? (
        <Text textStyle="p small italic">This transaction has not yet been confirmed by an owner.</Text>
      ) : (
        <>
          {approvers.map((approver) => (
            <HashScanLink id={approver} type={HashscanData.Account} />
          ))}
        </>
      );

    const TokenIdWithLink = token?.data.token_id ? (
      <HashScanLink id={token.data.token_id} type={HashscanData.Token} withParentheses />
    ) : (
      <></>
    );

    const ConfirmationDetailsButtons: Readonly<{ [key in TransactionStatus]: JSX.Element }> = {
      [TransactionStatus.Pending]: hasConnectedWalletVoted ? (
        <Button isDisabled leftIcon={<CheckCircleUnfilledIcon boxSize={4} />}>
          Confirmed by you
        </Button>
      ) : (
        <Button variant="primary" onClick={() => handleClickConfirmTransaction(safeId, transactionHash)}>
          Confirm
        </Button>
      ),
      [TransactionStatus.Queued]: (
        <Button
          variant="primary"
          onClick={() =>
            handleClickExecuteTransaction({
              safeId,
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
      [TransactionStatus.Success]: <></>,
      [TransactionStatus.Failed]: <></>,
    };

    return (
      <ProposalDetailsLayout
        title={type}
        statusComponent={
          <MetricLabel label="Status" value={<Tag variant={TransactionStatusAsTagVariant[transactionStatus]} />} />
        }
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
              <MetricLabel
                label={event}
                value={
                  <Flex direction="row" gap="2" alignItems="center">
                    <Text textStyle="p medium regular">
                      {amountDisplay} {token?.data.symbol}
                    </Text>
                    {TokenIdWithLink}
                  </Flex>
                }
              />
              <MetricLabel label={"To"} value={<HashScanLink id={receiver} type={HashscanData.Account} />} />
            </Flex>
            <Divider />
            <MetricLabel label={"Confirmations from"} value={ApproversList} />
            <Divider />
            <MetricLabel label={"Transaction Hash"} value={transactionHash} />
          </Flex>
        }
        rightPanel={
          <Flex direction="column" gap="8" minWidth="250px" height="100%">
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
            {ConfirmationDetailsButtons[transactionStatus]}
          </Flex>
        }
      />
    );
  }
  return <></>;
}
