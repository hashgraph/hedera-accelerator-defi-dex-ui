import { Text, Button, Flex, Spacer } from "@chakra-ui/react";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { useEffect, useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { Notification, MetricLabel, NotficationTypes, SettingsButton, useNotification, Color } from "../..";
import { CreatePoolFormData, InitialCreatePoolFormState } from "./constants";
import { FormSettings, useFormSettings } from "../FormSettings";
import { DefiFormLayout } from "../layouts";
import { TokenPair } from "../SwapTokensForm/types";
import { TokenInput } from "../TokenInput";
import { isNil } from "ramda";
import { TokenState } from "../types";
import { usePoolsData } from "@dex/hooks";
import { REFRESH_INTERVAL } from "@dex/hooks/constants";
import {
  getTokenBalance,
  getUniqueTokensFromSelectedOne,
  getTokensByUniqueAccountIds,
  getCreatePoolExchangeRate,
} from "@shared/utils";
import { CreatePoolState, SendCreatePoolTransactionParams, Pool } from "@dex/store/poolsSlice";
import { AlertDialog, LoadingDialog } from "../../components";
import { WarningIcon } from "@chakra-ui/icons";
import { TransactionStatus } from "@dex/store/appSlice";
import { convertNumberOfMinsToSeconds } from "@dex/utils";
import { useCreatePoolFormData } from "./useCreatePoolForm";
import { DropdownSelector } from "../../components";
import { PoolTransactionFee } from "@dex/hooks/pool/types";

interface CreatePoolFormProps {
  isLoading: boolean;
  pairedAccountBalance: AccountBalanceJson | null;
  tokenPairs: TokenPair[] | null;
  transactionFee: PoolTransactionFee[] | undefined;
  allPoolsMetrics: Pool[];
  transactionState: CreatePoolState;
  connectionStatus: HashConnectConnectionState;
  connectToWallet: () => void;
  sendCreatePoolTransaction: (params: SendCreatePoolTransactionParams) => Promise<void>;
  resetCreatePoolState: () => Promise<void>;
}

export function CreatePoolForm(props: CreatePoolFormProps) {
  const title = "Create Pool";
  const createPoolForm = useForm<CreatePoolFormData>({
    defaultValues: {
      ...InitialCreatePoolFormState,
    },
  });
  const formValues: CreatePoolFormData = structuredClone(createPoolForm.getValues());

  const [isConfirmCreatePoolDialogOpen, setIsConfirmCreatePoolDialogOpen] = useState(false);

  usePoolsData(REFRESH_INTERVAL);

  const isWalletPaired = props.connectionStatus === HashConnectConnectionState.Paired;

  createPoolForm.watch([
    "firstToken.displayAmount",
    "firstToken.symbol",
    "secondToken.symbol",
    "secondToken.displayAmount",
    "transactionFee",
  ]);

  const formSettings = useFormSettings({
    transactionDeadline: formValues.transactionDeadline,
  });

  const createPoolFormData = useCreatePoolFormData({
    firstToken: formValues.firstToken,
    secondToken: formValues.secondToken,
    transactionFee: formValues.transactionFee,
    isTransactionDeadlineValid: formSettings.isTransactionDeadlineValid,
    allPoolsMetrics: props.allPoolsMetrics,
  });

  const notification = useNotification({
    successMessage: createPoolFormData.successMessage,
    transactionState: {
      transactionWaitingToBeSigned: props.transactionState.status === "in progress",
      successPayload: props.transactionState.successPayload?.transactionResponse ?? null,
      errorMessage: props.transactionState.errorMessage,
    },
  });

  const uniqueTokens = getTokensByUniqueAccountIds(props.tokenPairs ?? []);
  const uniqueTokensFromSelectedOne = getUniqueTokensFromSelectedOne(
    formValues.firstToken?.tokenMeta?.tokenId ?? "",
    props.tokenPairs ?? []
  );
  const getCreatePoolExchangeRateDisplay = getCreatePoolExchangeRate({
    firstToken: formValues.firstToken,
    secondToken: formValues.secondToken,
  });

  /** Update Balances */
  useEffect(() => {
    const firstTokenBalance = getTokenBalance(
      formValues.firstToken.tokenMeta.tokenId ?? "",
      props.pairedAccountBalance
    );
    const secondTokenBalance = getTokenBalance(
      formValues.secondToken.tokenMeta.tokenId ?? "",
      props.pairedAccountBalance
    );
    createPoolForm.setValue("firstToken.balance", firstTokenBalance);
    createPoolForm.setValue("secondToken.balance", secondTokenBalance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.pairedAccountBalance)]);

  function handleFirstTokenSymbolChanged(updatedToken: TokenState) {
    const firstTokenBalance = getTokenBalance(updatedToken.tokenMeta.tokenId ?? "", props.pairedAccountBalance);
    const updatedFirstToken = {
      ...formValues.firstToken,
      symbol: updatedToken?.symbol,
      balance: firstTokenBalance,
    };
    createPoolForm.setValue("firstToken.balance", updatedFirstToken.balance);
    createPoolForm.setValue("firstToken.symbol", updatedFirstToken.symbol);
  }

  function handleFirstTokenAmountChanged(updatedToken: TokenState) {
    const updatedFirstToken = {
      ...formValues.firstToken,
      amount: updatedToken.amount || 0,
      displayAmount: updatedToken.amount ? String(updatedToken.amount) : "",
    };
    createPoolForm.setValue("firstToken.amount", updatedFirstToken.amount);
    createPoolForm.setValue("firstToken.displayAmount", updatedFirstToken.displayAmount);
  }

  function handleSecondTokenSymbolChanged(updatedToken: TokenState) {
    const secondTokenBalance = getTokenBalance(updatedToken?.tokenMeta.tokenId ?? "", props.pairedAccountBalance);
    const updatedSecondToken = {
      ...formValues.secondToken,
      symbol: updatedToken?.symbol,
      balance: secondTokenBalance,
    };
    createPoolForm.setValue("secondToken.symbol", updatedSecondToken.symbol);
    createPoolForm.setValue("secondToken.balance", updatedSecondToken.balance);
  }

  function handleSecondTokenAmountChanged(updatedToken: TokenState) {
    const updatedFirstToken = {
      ...formValues.firstToken,
      amount: updatedToken.amount || 0,
      displayAmount: updatedToken.amount ? String(updatedToken.amount) : "",
    };
    createPoolForm.setValue("secondToken.amount", updatedFirstToken.amount);
    createPoolForm.setValue("secondToken.displayAmount", updatedFirstToken.displayAmount);
  }

  function handleTransactionfeeClicked(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    const fee = inputElement.value;
    createPoolForm.setValue("transactionFee", Number(fee));
  }

  function onSubmit(data: CreatePoolFormData) {
    if (data.firstToken.symbol === undefined || data.secondToken.symbol === undefined) {
      console.error("Tokens must be selected to create a pool.");
      return;
    }
    const transactionDeadlineInSeconds = convertNumberOfMinsToSeconds(data.transactionDeadline);
    props.sendCreatePoolTransaction({
      firstToken: {
        symbol: data.firstToken.symbol,
        address: data.firstToken.tokenMeta.tokenId ?? "",
        amount: data.firstToken.amount,
      },
      secondToken: {
        symbol: data.secondToken.symbol,
        address: data.secondToken.tokenMeta.tokenId ?? "",
        amount: data.secondToken.amount,
      },
      transactionFee: data.transactionFee,
      transactionDeadline: transactionDeadlineInSeconds,
    });
  }

  return (
    <form onSubmit={createPoolForm.handleSubmit(onSubmit)} id="create-pool-form">
      <DefiFormLayout
        title={<Text textStyle="h2">{title}</Text>}
        settingsButton={
          <SettingsButton
            isError={!formSettings.isTransactionDeadlineValid}
            display={formSettings.formattedTransactionDeadline}
            onClick={formSettings.handleSettingsButtonClicked}
          />
        }
        notification={
          notification.isSuccessNotificationVisible && (
            <Notification
              type={NotficationTypes.SUCCESS}
              textStyle="b3"
              message={notification.successNotificationMessage}
              isLinkShown={true}
              linkText="View in HashScan"
              linkRef={notification.hashscanTransactionLink}
              isCloseButtonShown={true}
              handleClickClose={notification.handleCloseNotificationButtonClicked}
            />
          )
        }
        settingsInputs={
          <FormSettings
            isTransactionDeadlineValid={formSettings.isTransactionDeadlineValid}
            isSettingsOpen={formSettings.isSettingsOpen}
            hideSlippage
            initialTransactionDeadline={`${formSettings.transactionDeadline}`}
            handleTransactionDeadlineChanged={formSettings.handleTransactionDeadlineChanged}
            register={createPoolForm.register}
          />
        }
        isSettingsOpen={formSettings.isSettingsOpen}
        formInputs={[
          <TokenInput
            key="1"
            form={createPoolForm}
            fieldValue="firstToken"
            label="First Token"
            isHalfAndMaxButtonsVisible={true}
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={formValues.firstToken.tokenMeta.tokenId ?? ""}
            selectableTokens={uniqueTokens}
            isLoading={props.isLoading}
            tokenPairs={props.tokenPairs ?? []}
            onTokenAmountChanged={handleFirstTokenAmountChanged}
            onTokenSymbolChanged={handleFirstTokenSymbolChanged}
            onSetInputAmountWithFormula={handleFirstTokenAmountChanged}
          />,
          <Spacer key="2" />,
          <TokenInput
            key="3"
            form={createPoolForm}
            fieldValue="secondToken"
            label="Second Token"
            isHalfAndMaxButtonsVisible={true}
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={formValues.secondToken.tokenMeta.tokenId ?? ""}
            selectableTokens={uniqueTokensFromSelectedOne}
            isLoading={props.isLoading}
            tokenPairs={props.tokenPairs ?? []}
            onTokenAmountChanged={handleSecondTokenAmountChanged}
            onTokenSymbolChanged={handleSecondTokenSymbolChanged}
            onSetInputAmountWithFormula={handleSecondTokenAmountChanged}
          />,
          <Spacer padding="0.4rem" key="4" />,
          <Flex direction="column" key="5" justifyContent="center" gap="5px">
            <Text textStyle="h4">Transaction Fee</Text>
            <DropdownSelector
              data={props.transactionFee}
              value={formValues.transactionFee}
              isLoading={props.isLoading}
              selectControls={createPoolForm.register("transactionFee" as any, {
                onChange: handleTransactionfeeClicked,
              })}
            />
          </Flex>,
        ]}
        metrics={[
          //eslint-disable-next-line max-len
          <MetricLabel
            key="1"
            label="Exchange Ratio"
            value={getCreatePoolExchangeRateDisplay}
            isLoading={props.isLoading}
          />,
        ]}
        actionButtonNotifications={[
          !formSettings.isTransactionDeadlineValid ? (
            <Notification
              key="1"
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message={formSettings.transactionDeadlineErrorMessage}
            />
          ) : null,
          createPoolFormData.isSelectedPoolAlreadyExist ? (
            <Notification
              key="2"
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message={createPoolFormData.poolAlreadyExistMessage}
            />
          ) : null,
        ].filter((notification: React.ReactNode) => !isNil(notification))}
        actionButtons={
          isWalletPaired ? (
            <>
              <AlertDialog
                title="Confirm Create Pool"
                openDialogButtonText="Create Pool"
                isOpenDialogButtonDisabled={createPoolFormData.isSubmitButtonDisabled}
                body={
                  <Flex flexDirection="column">
                    <Flex paddingBottom="0.25rem">
                      <Text flex="2" textStyle="b1">
                        First Token
                      </Text>
                      <Text flex="2" textStyle="b1" textAlign="right">
                        {formValues.firstToken.displayAmount}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text flex="2" textStyle="b1">
                        Second Token
                      </Text>
                      <Text flex="2" textStyle="b1" textAlign="right">
                        {formValues.secondToken.displayAmount}
                      </Text>
                    </Flex>
                    <Spacer padding="0.667rem" />
                    <Flex flexDirection="column" gap="0.5rem">
                      <Flex>
                        <Text flex="1" textStyle="b3" color={Color.Grey_02}>
                          Exchange Rate
                        </Text>
                        <Text flex="2" textStyle="b3" textAlign="right">
                          {getCreatePoolExchangeRateDisplay}
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
                    isDisabled={createPoolFormData.isSubmitButtonDisabled}
                    onClick={() => {
                      setIsConfirmCreatePoolDialogOpen(false);
                      createPoolForm.handleSubmit(onSubmit)();
                      notification.setIsNotificationVisible(true);
                    }}
                  >
                    Create Pool
                  </Button>
                }
                alertDialogOpen={isConfirmCreatePoolDialogOpen}
                onAlertDialogOpen={() => setIsConfirmCreatePoolDialogOpen(true)}
                onAlertDialogClose={() => setIsConfirmCreatePoolDialogOpen(false)}
              />
              <LoadingDialog
                isOpen={props.transactionState.status === TransactionStatus.IN_PROGRESS}
                message={"Please confirm the create pool transaction to proceed."}
              />
              <LoadingDialog
                isOpen={props.transactionState.status === TransactionStatus.ERROR}
                message={props.transactionState.errorMessage ?? ""}
                icon={<WarningIcon color="#EF5C5C" h={10} w={10} />}
                buttonConfig={{
                  text: "Dismiss",
                  onClick: () => {
                    props.resetCreatePoolState();
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
