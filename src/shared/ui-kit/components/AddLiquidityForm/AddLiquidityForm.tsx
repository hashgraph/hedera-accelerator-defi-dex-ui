import { Text, Button, Flex, Spacer } from "@chakra-ui/react";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AddLiquidityFormData, InitialAddLiquidityFormState } from "./constants";
import { FormSettings, useFormSettings } from "../FormSettings";
import { DefiFormLayout } from "../layouts";
import { TokenPair } from "../SwapTokensForm/types";
import { TokenInput } from "../TokenInput";
import { isEmpty, isNil } from "ramda";
import { TokenState } from "../types";
import { usePoolsData, useSwapData } from "@dex/hooks";
import { REFRESH_INTERVAL } from "@dex/hooks/constants";
import {
  calculatePoolRatio,
  getExchangeRateDisplay,
  getPairedTokenData,
  getPairedTokens,
  getSpotPrice,
  getTokenBalance,
  getTokenExchangeAmount,
  getTokensByUniqueAccountIds,
} from "@shared/utils";
import { InitialTokenState } from "../constants";
import { AddLiquidityState, SendAddLiquidityTransactionParams, UserPool } from "@dex/store/poolsSlice";
import {
  AlertDialog,
  DropdownSelector,
  LoadingDialog,
  MetricLabel,
  Notification,
  NotficationTypes,
  useNotification,
} from "../../components";
import { SettingsButton } from "../Button";
import { WarningIcon } from "@chakra-ui/icons";
import { TransactionStatus } from "@dex/store/appSlice";
import { convertNumberOfMinsToSeconds, getAllPoolTransactionFee } from "@dex/utils";
import { isNotNil } from "ramda";
import { Color } from "../../themes";

const DefaultTokenMeta = InitialTokenState.tokenMeta;

interface AddLiquidityFormProps {
  isLoading: boolean;
  selectedFromPoolPairId?: string | undefined;
  poolName: string | undefined;
  pairedAccountBalance: AccountBalanceJson | null;
  tokenPairs: TokenPair[] | null;
  spotPrices: Record<string, number | undefined>;
  userPoolsMetrics: UserPool[];
  transactionState: AddLiquidityState;
  connectionStatus: HashConnectConnectionState;
  connectToWallet: () => void;
  fetchPairInfo: (selectedAccountId: string) => Promise<void>;
  sendAddLiquidityTransaction: ({
    inputToken,
    outputToken,
    contractId,
    transactionDeadline,
  }: SendAddLiquidityTransactionParams) => Promise<void>;
  resetAddLiquidityState: () => Promise<void>;
}

export function AddLiquidityForm(props: AddLiquidityFormProps) {
  const title = "Add Liquidity";
  const addLiquidityForm = useForm<AddLiquidityFormData>({
    defaultValues: {
      ...InitialAddLiquidityFormState,
    },
  });
  const formValues: AddLiquidityFormData = structuredClone(addLiquidityForm.getValues());

  const formSettings = useFormSettings({
    slippage: formValues.slippage,
    transactionDeadline: formValues.transactionDeadline,
  });
  addLiquidityForm.watch(["firstToken.displayAmount", "firstToken.symbol", "secondToken.symbol", "fee", "poolName"]);

  const [isConfirmAddLiquidityDialogOpen, setIsConfirmAddLiquidityDialogOpen] = useState(false);

  const selectedPairContractId = formValues.firstToken.tokenMeta.pairAccountId ?? "";
  usePoolsData(REFRESH_INTERVAL);
  useSwapData(selectedPairContractId, REFRESH_INTERVAL);

  const isWalletPaired = props.connectionStatus === HashConnectConnectionState.Paired;

  const isSubmitButtonDisabled =
    isEmpty(formValues.firstToken.displayAmount) ||
    isNil(formValues.firstToken.symbol) ||
    isEmpty(formValues.secondToken.displayAmount) ||
    isNil(formValues.secondToken.symbol) ||
    !formSettings.isTransactionDeadlineValid;

  const successMessage = `Added
  ${formValues.firstToken.amount.toFixed(6)} 
  ${formValues.firstToken.symbol}
  and ${formValues.secondToken.amount.toFixed(6)} ${formValues.secondToken.symbol} to pool.`;

  const notification = useNotification({
    successMessage,
    transactionState: {
      transactionWaitingToBeSigned: props.transactionState.status === "in progress",
      successPayload: props.transactionState.successPayload?.transactionResponse ?? null,
      errorMessage: props.transactionState.errorMessage,
    },
  });

  const spotPrice = getSpotPrice({
    spotPrices: props.spotPrices,
    tokenToTrade: formValues.firstToken,
    tokenToReceive: formValues.secondToken,
  });

  const poolRatio = calculatePoolRatio(
    formValues.firstToken.symbol ?? "",
    formValues.secondToken.symbol ?? "",
    props.userPoolsMetrics
  );

  const exchangeRatio = getExchangeRateDisplay({
    spotPrice,
    tokenToTradeSymbol: formValues.firstToken.symbol,
    tokenToReceiveSymbol: formValues.secondToken.symbol,
  });

  const allPoolFee = getAllPoolTransactionFee({
    tokenPairs: props.tokenPairs,
    tokenAId: formValues.firstToken.tokenMeta.tokenId,
    tokenBId: formValues.secondToken.tokenMeta.tokenId,
  });

  const tokensWithPairs = getTokensByUniqueAccountIds(props.tokenPairs ?? []);
  const tokensPairedWithFirstToken = getPairedTokens(
    formValues.firstToken?.tokenMeta?.tokenId ?? "",
    props.tokenPairs ?? []
  );

  const updateBalances = (firstTokenId: string, secondTokenId: string) => {
    const firstTokenBalance = getTokenBalance(firstTokenId, props.pairedAccountBalance);
    const secondTokenBalance = getTokenBalance(secondTokenId, props.pairedAccountBalance);
    addLiquidityForm.setValue("firstToken.balance", firstTokenBalance);
    addLiquidityForm.setValue("secondToken.balance", secondTokenBalance);
  };

  /** Update Balances */
  useEffect(() => {
    updateBalances(formValues.firstToken.tokenMeta.tokenId ?? "", formValues.secondToken.tokenMeta.tokenId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.pairedAccountBalance)]);

  useEffect(() => {
    const selectedPair = props.tokenPairs?.find(
      (tokenPair) => tokenPair.tokenA.tokenMeta.pairAccountId === props.selectedFromPoolPairId
    );
    if (selectedPair) {
      addLiquidityForm.setValue("firstToken", selectedPair.tokenA);
      addLiquidityForm.setValue("secondToken", selectedPair.tokenB);
      addLiquidityForm.setValue("fee", selectedPair.tokenA.tokenMeta.fee?.toNumber() ?? 0);
      addLiquidityForm.setValue("poolName", props.poolName ?? "");
      updateBalances(selectedPair.tokenA.tokenMeta.tokenId ?? "", selectedPair.tokenB.tokenMeta.tokenId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedFromPoolPairId, props.tokenPairs]);

  function handleTransactionFeeChanged(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    const fee = inputElement.value;
    addLiquidityForm.setValue("fee", Number(fee));

    const selectedPair = props.tokenPairs?.find(
      (pair) =>
        (pair.tokenA.tokenMeta.fee?.toNumber() ?? 0) === Number(fee) &&
        ((formValues.firstToken.tokenMeta.tokenId === pair.tokenA.tokenMeta.tokenId &&
          formValues.secondToken.tokenMeta.tokenId === pair.tokenB.tokenMeta.tokenId) ||
          (formValues.secondToken.tokenMeta.tokenId === pair.tokenA.tokenMeta.tokenId &&
            formValues.firstToken.tokenMeta.tokenId === pair.tokenB.tokenMeta.tokenId))
    );
    addLiquidityForm.setValue("firstToken.tokenMeta", selectedPair?.tokenA?.tokenMeta ?? DefaultTokenMeta);
    addLiquidityForm.setValue("secondToken.tokenMeta", selectedPair?.tokenB?.tokenMeta ?? DefaultTokenMeta);
  }

  function onSubmit(data: AddLiquidityFormData) {
    if (data.firstToken.symbol === undefined || data.secondToken.symbol === undefined) {
      console.error("Tokens must be selected to add liquidity to a pool.");
      return;
    }
    const transactionDeadlineInSeconds = convertNumberOfMinsToSeconds(data.transactionDeadline);
    props.sendAddLiquidityTransaction({
      inputToken: {
        symbol: data.firstToken.symbol,
        amount: data.firstToken.amount,
        address: data.firstToken.tokenMeta.tokenId ?? "",
      },
      outputToken: {
        symbol: data.secondToken.symbol,
        amount: data.secondToken.amount,
        address: data.secondToken.tokenMeta.tokenId ?? "",
      },
      lpTokenId: data.firstToken.tokenMeta.lpTokenId ?? "",
      contractId: data.secondToken.tokenMeta.pairAccountId ?? "",
      transactionDeadline: transactionDeadlineInSeconds,
    });
  }

  function handleFirstTokenAmountChanged(updatedToken: TokenState) {
    const secondTokenSpotPrice = getSpotPrice({
      spotPrices: props.spotPrices,
      tokenToTrade: updatedToken,
      tokenToReceive: formValues.secondToken,
    });

    //TODO: A Temporary fix when a Pair comes with 0 liquidity
    if (isNotNil(secondTokenSpotPrice) && isFinite(secondTokenSpotPrice) && secondTokenSpotPrice > 0) {
      const secondTokenAmount = getTokenExchangeAmount(updatedToken.amount, secondTokenSpotPrice);
      const updatedSecondToken = {
        ...formValues.secondToken,
        amount: secondTokenAmount || 0,
        displayAmount: secondTokenAmount ? String(secondTokenAmount) : "",
      };
      addLiquidityForm.setValue("secondToken.amount", updatedSecondToken.amount);
      addLiquidityForm.setValue("secondToken.displayAmount", updatedSecondToken.displayAmount);
    }
  }

  function handleFirstTokenSymbolChanged(_updatedToken: TokenState) {
    addLiquidityForm.setValue("secondToken", InitialAddLiquidityFormState.secondToken);
    addLiquidityForm.setValue("poolName", "");
    addLiquidityForm.setValue("fee", 0);
  }

  function handleSecondTokenAmountChanged(updatedToken: TokenState) {
    const firstTokenSpotPrice = getSpotPrice({
      spotPrices: props.spotPrices,
      tokenToTrade: updatedToken,
      tokenToReceive: formValues.firstToken,
    });
    if (isNotNil(firstTokenSpotPrice) && isFinite(firstTokenSpotPrice) && firstTokenSpotPrice > 0) {
      const firstTokenAmount = getTokenExchangeAmount(updatedToken.amount, firstTokenSpotPrice);
      const updatedFirstToken = {
        ...formValues.firstToken,
        amount: firstTokenAmount || 0,
        displayAmount: firstTokenAmount ? String(firstTokenAmount) : "",
      };
      addLiquidityForm.setValue("firstToken.amount", updatedFirstToken.amount);
      addLiquidityForm.setValue("firstToken.displayAmount", updatedFirstToken.displayAmount);
    }
  }

  function handleSecondTokenSymbolChanged(updatedToken: TokenState) {
    const { tokenToTradeData: firstTokenData, tokenToReceiveData: secondTokenData } = getPairedTokenData(
      formValues.firstToken.tokenMeta.tokenId ?? "",
      updatedToken,
      props.tokenPairs ?? []
    );
    const firstTokenBalance = getTokenBalance(firstTokenData?.tokenMeta.tokenId ?? "", props.pairedAccountBalance);
    const updatedFirstToken = {
      ...formValues.firstToken,
      tokenMeta: firstTokenData?.tokenMeta ?? formValues.firstToken.tokenMeta,
      symbol: firstTokenData?.symbol ?? formValues.firstToken.symbol,
      balance: firstTokenBalance,
    };
    addLiquidityForm.setValue("firstToken.symbol", updatedFirstToken.symbol);
    addLiquidityForm.setValue("firstToken.balance", updatedFirstToken.balance);
    addLiquidityForm.setValue("firstToken.tokenMeta", updatedFirstToken.tokenMeta);
    const secondTokenBalance = getTokenBalance(secondTokenData?.tokenMeta.tokenId ?? "", props.pairedAccountBalance);
    const updatedSecondToken = {
      ...formValues.secondToken,
      symbol: secondTokenData?.symbol,
      tokenMeta: secondTokenData?.tokenMeta ?? DefaultTokenMeta,
      balance: secondTokenBalance,
    };
    addLiquidityForm.setValue("secondToken.symbol", updatedSecondToken.symbol);
    addLiquidityForm.setValue("secondToken.balance", updatedSecondToken.balance);
    addLiquidityForm.setValue("secondToken.tokenMeta", updatedSecondToken.tokenMeta);
    addLiquidityForm.setValue("poolName", `${updatedFirstToken.symbol}-${updatedSecondToken.symbol}`);
    props.fetchPairInfo(updatedFirstToken.tokenMeta.pairAccountId ?? "");
  }

  return (
    <form onSubmit={addLiquidityForm.handleSubmit(onSubmit)} id="add-liquidity-form">
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
            handleSlippageChanged={formSettings.handleSlippageChanged}
            initialSlippage={`${formSettings.slippage}`}
            initialTransactionDeadline={`${formSettings.transactionDeadline}`}
            handleTransactionDeadlineChanged={formSettings.handleTransactionDeadlineChanged}
            register={addLiquidityForm.register}
          />
        }
        isSettingsOpen={formSettings.isSettingsOpen}
        formInputs={[
          <TokenInput
            form={addLiquidityForm}
            fieldValue="firstToken"
            label="First Token"
            isHalfAndMaxButtonsVisible={true}
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={formValues.firstToken.tokenMeta.tokenId ?? ""}
            selectableTokens={tokensWithPairs}
            isLoading={props.isLoading}
            tokenPairs={props.tokenPairs ?? []}
            onTokenAmountChanged={handleFirstTokenAmountChanged}
            onTokenSymbolChanged={handleFirstTokenSymbolChanged}
            onSetInputAmountWithFormula={handleFirstTokenAmountChanged}
            key="1"
          />,
          <Spacer key="2" />,
          <TokenInput
            form={addLiquidityForm}
            fieldValue="secondToken"
            label="Second Token"
            isHalfAndMaxButtonsVisible={true}
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={formValues.secondToken.tokenMeta.tokenId ?? ""}
            selectableTokens={tokensPairedWithFirstToken}
            isLoading={props.isLoading}
            tokenPairs={props.tokenPairs ?? []}
            onTokenAmountChanged={handleSecondTokenAmountChanged}
            onTokenSymbolChanged={handleSecondTokenSymbolChanged}
            onSetInputAmountWithFormula={handleSecondTokenAmountChanged}
            key="3"
          />,
          <Spacer padding="0.4rem" key="4" />,
          allPoolFee.length > 1 ? (
            <Flex direction="column" justifyContent="center" gap="5px" key="5">
              <Text textStyle="h4">Transaction Fee</Text>
              <DropdownSelector
                isLoading={props.isLoading}
                data={allPoolFee}
                value={formValues.fee}
                selectControls={addLiquidityForm.register("transactionFee" as any, {
                  onChange: handleTransactionFeeChanged,
                })}
              />
            </Flex>
          ) : null,
        ]}
        metrics={[
          <MetricLabel key="1" label="Share of Pool" value={poolRatio} isLoading={props.isLoading} />,
          <MetricLabel key="2" label="Exchange Ratio" value={exchangeRatio} isLoading={props.isLoading} />,
        ]}
        actionButtonNotifications={[
          !formSettings.isTransactionDeadlineValid ? (
            <Notification
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message={formSettings.transactionDeadlineErrorMessage}
            />
          ) : null,
        ].filter((notification: React.ReactNode) => !isNil(notification))}
        actionButtons={
          isWalletPaired ? (
            <>
              <AlertDialog
                title="Confirm Add Liquidity"
                openDialogButtonText="Add Liquidity"
                isOpenDialogButtonDisabled={isSubmitButtonDisabled}
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
                          Share of Pool
                        </Text>
                        <Text flex="2" textStyle="b3" textAlign="right">
                          {poolRatio}
                        </Text>
                      </Flex>
                      <Flex>
                        <Text flex="1" textStyle="b3" color={Color.Grey_02}>
                          Exchange Rate
                        </Text>
                        <Text flex="2" textStyle="b3" textAlign="right">
                          {exchangeRatio}
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
                      setIsConfirmAddLiquidityDialogOpen(false);
                      addLiquidityForm.handleSubmit(onSubmit)();
                      notification.setIsNotificationVisible(true);
                    }}
                  >
                    Add Liquidity
                  </Button>
                }
                alertDialogOpen={isConfirmAddLiquidityDialogOpen}
                onAlertDialogOpen={() => setIsConfirmAddLiquidityDialogOpen(true)}
                onAlertDialogClose={() => setIsConfirmAddLiquidityDialogOpen(false)}
              />
              <LoadingDialog
                isOpen={props.transactionState.status === TransactionStatus.IN_PROGRESS}
                message={"Please confirm the add liquidity transaction in your wallet to proceed."}
              />
              <LoadingDialog
                isOpen={props.transactionState.status === TransactionStatus.ERROR}
                message={props.transactionState.errorMessage ?? ""}
                icon={<WarningIcon color="#EF5C5C" h={10} w={10} />}
                buttonConfig={{
                  text: "Dismiss",
                  onClick: () => {
                    props.resetAddLiquidityState();
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
