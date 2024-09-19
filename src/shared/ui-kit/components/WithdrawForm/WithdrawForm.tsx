import { Text, Button, Flex, Spacer } from "@chakra-ui/react";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Notification, MetricLabel, NotficationTypes, SettingsButton } from "../../components";
import { Color } from "../../themes";
import { InitialWithdrawFormState, WithdrawFormData } from "./constants";
import { FormSettings, useFormSettings } from "../FormSettings";
import { DefiFormLayout } from "../layouts";
import { isEmpty, isNil } from "ramda";
import { LPTokenDetails, PoolLiquidityDetails } from "./types";
import { SendWithdrawTransactionParams, WithdrawState } from "@dex/store/poolsSlice";
import { convertNumberOfMinsToSeconds } from "@dex/utils";
import { AlertDialog, LoadingDialog } from "../../components";
import { TransactionStatus } from "@dex/store/appSlice";
import { WarningIcon } from "@chakra-ui/icons";
import { LPTokenInput } from "../LPTokenInput";

interface WithdrawFormProps {
  isLoading: boolean;
  poolLpDetails: LPTokenDetails;
  poolLiquidityDetails: PoolLiquidityDetails;
  transactionState: WithdrawState;
  connectionStatus: HashConnectConnectionState;
  connectToWallet: () => void;
  sendWithdrawTransaction: (params: SendWithdrawTransactionParams) => Promise<void>;
  resetWithdrawState: () => Promise<void>;
}

export function WithdrawForm(props: WithdrawFormProps) {
  const title = "Withdraw";
  const withdrawForm = useForm<WithdrawFormData>({
    defaultValues: {
      ...InitialWithdrawFormState,
    },
  });

  const formValues: WithdrawFormData = structuredClone(withdrawForm.getValues());

  const formSettings = useFormSettings({
    transactionDeadline: formValues.transactionDeadline,
  });
  withdrawForm.watch("lpToken.displayAmount");
  withdrawForm.watch("lpToken.amount");

  const [isConfirmWithdrawDialogOpen, setIsConfirmWithdrawDialogOpen] = useState(false);

  const isWalletPaired = props.connectionStatus === HashConnectConnectionState.Paired;

  const confirmMessage = `Please confirm ${props.poolLpDetails.tokenSymbol} withdrawal in your wallet to proceed.`;

  const fullPoolWithdrawalMessage = `You are removing all your remaining liquidity from this pool.\n
                                        This withdrawal will also include the following unclaimed fees: 
                                        ${props.poolLpDetails.unclaimedFees}`;

  const isFullPoolWithdrawMessageVisible = formValues.lpToken.amount
    ? formValues.lpToken.amount === props.poolLpDetails.userLpAmount
    : false;

  const thresholdBreached = "Cannot withdraw more than the balance";
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
      fee: `${props.poolLpDetails.fee}`,
      pairAcountId: props.poolLpDetails.pairAccountId ?? "",
      tokenSymbol: props.poolLpDetails.tokenSymbol ?? "",
      lpAccountId: props.poolLpDetails.lpAccountId ?? "",
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
          <Text key="1">{props.poolLpDetails?.tokenSymbol}</Text>,
          <LPTokenInput
            form={withdrawForm}
            balance={props.poolLpDetails.userLpAmount}
            label="Token to Receive"
            fieldValue="lpToken"
            walletConnectionStatus={props.connectionStatus}
            isHalfAndMaxButtonsVisible
            isLoading={props.isLoading}
            key="2"
          />,
        ]}
        metrics={[
          [
            <MetricLabel
              label={`${props.poolLiquidityDetails?.firstToken.tokenSymbol} in Pool`}
              value={`${props.poolLiquidityDetails?.firstToken.poolLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
              key="1"
            />,
            <Spacer padding="0.3rem" key="2" />,
            <MetricLabel
              label={`${props.poolLiquidityDetails?.secondToken.tokenSymbol} in Pool`}
              value={`${props.poolLiquidityDetails?.secondToken.poolLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
              key="3"
            />,
          ],
          [
            <MetricLabel
              label={`${props.poolLiquidityDetails?.firstToken.tokenSymbol} to Withdraw`}
              value={`${props.poolLiquidityDetails?.firstToken.userProvidedLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
              key="1"
            />,
            <Spacer padding="0.3rem" key="2" />,
            <MetricLabel
              label={`${props.poolLiquidityDetails?.secondToken.tokenSymbol} to Withdraw`}
              value={`${props.poolLiquidityDetails?.secondToken.userProvidedLiquidity.toFixed(6)}`}
              isLoading={props.isLoading}
              key="3"
            />,
          ],
          [
            <MetricLabel
              label={"Remaining share of pool"}
              value={props.poolLpDetails?.userLpPercentage ?? ""}
              isLoading={props.isLoading}
              key="ml"
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
