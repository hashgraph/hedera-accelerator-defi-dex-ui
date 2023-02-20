import { Text, Button, Flex, Spacer } from "@chakra-ui/react";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Notification, MetricLabel, NotficationTypes, SettingsButton, Color } from "../..";
import { WithdrawFormData } from "./constants";
import { FormSettings, useFormSettings } from "../FormSettings";
import { DefiFormLayout } from "../layouts";
import { isEmpty, isNil } from "ramda";
import { LPTokenDetails, PoolLiquidityDetails } from "./types";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { SendWithdrawTransactionParams, WithdrawState } from "../../../dex-ui/store/poolsSlice";
import { convertNumberOfMinsToSeconds } from "../../../dex-ui/utils";
import { AlertDialog, LoadingDialog } from "../../base";
import { TransactionStatus } from "../../../dex-ui/store/appSlice";
import { WarningIcon } from "@chakra-ui/icons";
import { LPTokenInput } from "../LPTokenInput";
import { getTokenBalance } from "../utils";
import { InitialTransactionDeadline } from "../constants";

interface WithdrawFormProps {
  isLoading: boolean;
  poolLpDetails: LPTokenDetails;
  poolLiquidityDetails: PoolLiquidityDetails;
  transactionState: WithdrawState;
  pairedAccountBalance: AccountBalanceJson | null;
  connectionStatus: HashConnectConnectionState;
  connectToWallet: () => void;
  sendWithdrawTransaction: (params: SendWithdrawTransactionParams) => Promise<void>;
  resetWithdrawState: () => Promise<void>;
}

export function WithdrawForm(props: WithdrawFormProps) {
  const title = "Withdraw";
  const withdrawForm = useForm<WithdrawFormData>({
    defaultValues: {
      lpToken: { ...props.poolLpDetails },
      transactionDeadline: InitialTransactionDeadline,
    },
  });

  //TODO: The default values does not refresh when page reloads so manually updating the value here
  withdrawForm.setValue("lpToken.tokenSymbol", props.poolLpDetails.tokenSymbol);
  withdrawForm.setValue("lpToken.userLpAmount", props.poolLpDetails.userLpAmount);
  withdrawForm.setValue("lpToken.userLpPercentage", props.poolLpDetails.userLpPercentage);
  withdrawForm.setValue("lpToken.lpAccountId", props.poolLpDetails.lpAccountId);
  withdrawForm.setValue("lpToken.pairAccountId", props.poolLpDetails.pairAccountId);
  withdrawForm.setValue("lpToken.fee", props.poolLpDetails.fee);

  useEffect(() => {
    const useLpBalance = getTokenBalance(props.poolLpDetails.lpAccountId ?? "", props.pairedAccountBalance);
    withdrawForm.setValue("lpToken.userLpAmount", useLpBalance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.pairedAccountBalance)]);

  const formValues: WithdrawFormData = structuredClone(withdrawForm.getValues());

  const formSettings = useFormSettings({
    transactionDeadline: formValues.transactionDeadline,
  });
  withdrawForm.watch("lpToken.displayAmount");
  withdrawForm.watch("lpToken.amount");

  const [isConfirmWithdrawDialogOpen, setIsConfirmWithdrawDialogOpen] = useState(false);

  const isWalletPaired = props.connectionStatus === HashConnectConnectionState.Paired;

  const confirmMessage = `Please confirm ${formValues.lpToken.tokenSymbol} withdrawal in your wallet to proceed.`;

  const fullPoolWithdrawalMessage = `You are removing all your remaining liquidity from this pool.\n
                                        This withdrawal will also include the following unclaimed fees: 
                                        ${props.poolLpDetails.unclaimedFees}`;

  const isFullPoolWithdrawMessageVisible = formValues.lpToken.amount === props.poolLpDetails.userLpAmount;

  const thresholdBreached = "You cannot withdraw more than the balance";
  const isThresholdBreached = formValues.lpToken.amount > props.poolLpDetails.userLpAmount;

  const isSubmitButtonDisabled =
    isNil(formValues.lpToken.amount) ||
    formValues.lpToken.amount === 0 ||
    !formSettings.isTransactionDeadlineValid ||
    isThresholdBreached;

  function onSubmit(data: WithdrawFormData) {
    if (isEmpty(data.lpToken.amount)) {
      console.error("LpInput Amount is Empty");
      return;
    }
    const transactionDeadlineInSeconds = convertNumberOfMinsToSeconds(data.transactionDeadline);
    props.sendWithdrawTransaction({
      lpTokenAmount: data.lpToken.amount,
      transactionDeadline: transactionDeadlineInSeconds,
      fee: `${data.lpToken.fee}`,
      pairAcountId: data.lpToken.pairAccountId ?? "",
      tokenSymbol: data.lpToken.tokenSymbol ?? "",
      lpAccountId: data.lpToken.lpAccountId ?? "",
    });
  }

  return (
    <form onSubmit={withdrawForm.handleSubmit(onSubmit)} id="withdraw-form">
      <DefiFormLayout
        title={<Text textStyle="h2">{title}</Text>}
        settingsButton={
          <SettingsButton
            isError={!formSettings.isTransactionDeadlineValid}
            display={formSettings.formattedTransactionDeadline}
            onClick={formSettings.handleSettingsButtonClicked}
          />
        }
        settingsInputs={
          <FormSettings
            isTransactionDeadlineValid={formSettings.isTransactionDeadlineValid}
            isSettingsOpen={formSettings.isSettingsOpen}
            hideSlippage
            initialTransactionDeadline={`${formSettings.transactionDeadline}`}
            handleTransactionDeadlineChanged={formSettings.handleTransactionDeadlineChanged}
            register={withdrawForm.register}
          />
        }
        isSettingsOpen={formSettings.isSettingsOpen}
        formInputs={[
          <Text>{props.poolLpDetails?.tokenSymbol}</Text>,
          <LPTokenInput
            form={withdrawForm}
            label="Token to Receive"
            fieldValue="lpToken"
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={props.poolLpDetails.lpAccountId}
            isHalfAndMaxButtonsVisible
            isLoading={props.isLoading}
          />,
        ]}
        metrics={[
          [
            <MetricLabel
              label={`${props.poolLiquidityDetails?.firstToken.tokenSymbol} in Pool`}
              value={`${props.poolLiquidityDetails?.firstToken.poolLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
            />,
            <Spacer padding="0.3rem" />,
            <MetricLabel
              label={`${props.poolLiquidityDetails?.secondToken.tokenSymbol} in Pool`}
              value={`${props.poolLiquidityDetails?.secondToken.poolLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
            />,
          ],
          [
            <MetricLabel
              label={`${props.poolLiquidityDetails?.firstToken.tokenSymbol} to Withdraw`}
              value={`${props.poolLiquidityDetails?.firstToken.userProvidedLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
            />,
            <Spacer padding="0.3rem" />,
            <MetricLabel
              label={`${props.poolLiquidityDetails?.secondToken.tokenSymbol} to Withdraw`}
              value={`${props.poolLiquidityDetails?.secondToken.userProvidedLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
            />,
          ],
          [
            <MetricLabel
              label={"Remaining share of pool"}
              value={props.poolLpDetails?.userLpPercentage ?? ""}
              isLoading={props.isLoading}
            />,
          ],
        ]}
        actionButtonNotifications={[
          !formSettings.isTransactionDeadlineValid ? (
            <Notification
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message={formSettings.transactionDeadlineErrorMessage}
            />
          ) : null,
          isFullPoolWithdrawMessageVisible ? (
            <Flex direction="column" gap="4" width="fit-content">
              <Notification type={NotficationTypes.WARNING} textStyle="b3" message={fullPoolWithdrawalMessage} />
            </Flex>
          ) : null,
          isThresholdBreached ? (
            <Notification type={NotficationTypes.ERROR} textStyle="b3" message={thresholdBreached} />
          ) : null,
        ].filter((notification: React.ReactNode) => !isNil(notification))}
        actionButtons={
          isWalletPaired ? (
            <>
              <AlertDialog
                title="Confirm Withdraw"
                openDialogButtonText="Withdraw"
                isOpenDialogButtonDisabled={isSubmitButtonDisabled}
                body={
                  <Flex flexDirection="column">
                    <Flex paddingBottom="0.25rem">
                      <Text flex="2" textStyle="b1">
                        Token To Receive
                      </Text>
                      <Text flex="2" textStyle="b1" textAlign="right">
                        {formValues.lpToken.amount}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text flex="2" textStyle="b1">
                        Balance
                      </Text>
                      <Text flex="2" textStyle="b1" textAlign="right">
                        {props.poolLpDetails.userLpAmount}
                      </Text>
                    </Flex>
                    <Spacer padding="0.667rem" />
                    <Flex flexDirection="column" gap="0.5rem">
                      <Flex>
                        <Text flex="1" textStyle="b3" color={Color.Grey_02}>
                          Remaining Share of Pool
                        </Text>
                        <Text flex="2" textStyle="b3" textAlign="right">
                          {props.poolLpDetails.userLpPercentage}
                        </Text>
                      </Flex>
                      <Flex>
                        <Text flex="1" textStyle="b3" color={Color.Grey_02}>
                          Gas Fee
                        </Text>
                        <Text flex="2" textStyle="b3" textAlign="right">
                          {"--"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                }
                footer={
                  <Button
                    variant="primary"
                    flex="1"
                    isDisabled={isSubmitButtonDisabled}
                    onClick={() => {
                      setIsConfirmWithdrawDialogOpen(false);
                      withdrawForm.handleSubmit(onSubmit)();
                    }}
                  >
                    Withdraw
                  </Button>
                }
                alertDialogOpen={isConfirmWithdrawDialogOpen}
                onAlertDialogOpen={() => setIsConfirmWithdrawDialogOpen(true)}
                onAlertDialogClose={() => setIsConfirmWithdrawDialogOpen(false)}
              />
              <LoadingDialog
                isOpen={props.transactionState.status === TransactionStatus.IN_PROGRESS}
                message={confirmMessage}
              />
              <LoadingDialog
                isOpen={props.transactionState.status === TransactionStatus.ERROR}
                message={props.transactionState.errorMessage ?? ""}
                icon={<WarningIcon color="#EF5C5C" h={10} w={10} />}
                buttonConfig={{
                  text: "Dismiss",
                  onClick: () => {
                    props.resetWithdrawState();
                  },
                }}
              />
            </>
          ) : (
            <Button variant="primary" data-testid="connect-wallet-button" onClick={props.connectToWallet}>
              Connect Wallet
            </Button>
          )
        }
      />
    </form>
  );
}
