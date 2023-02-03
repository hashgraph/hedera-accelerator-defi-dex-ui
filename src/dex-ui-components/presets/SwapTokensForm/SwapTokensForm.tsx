import { Text, Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  MetricLabel,
  SettingsButton,
  SwitchTokenButton,
  Notification,
  NotficationTypes,
  useNotification,
} from "../../base";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { TransactionState } from "../../../dex-ui/store/swapSlice";
import { DefiFormLayout } from "../layouts";
import { SwapTokensFormData, Token, TokenPair } from "./types";
import { TokenState } from "../types";
import { useEffect } from "react";
import { SwapConfirmation, SwapConfirmationStep } from "./SwapConfirmation";
import { TokenInput } from "../TokenInput";
import {
  getExchangeRateDisplay,
  getPairedTokenData,
  getPairedTokens,
  getPoolLiquidityForTokenId,
  calculatePriceImpact,
  calculateTokenAmountToReceive,
  getSpotPrice,
  getTokenBalance,
  getTokensByUniqueAccountIds,
} from "../utils";
import { InitialTokenState } from "../constants";
import { InitialSwapFormState } from "./constants";
import { isEmpty, isNil } from "ramda";
import { useSwapData } from "../../../dex-ui/hooks";
import { REFRESH_INTERVAL } from "../../../dex-ui/hooks/constants";
import { FormSettings, useFormSettings } from "../FormSettings";

const DefaultTokenMeta = InitialTokenState.tokenMeta;

interface SwapTokensFormProps {
  fee: string;
  isLoading: boolean;
  pairedAccountBalance: AccountBalanceJson | null;
  tokenPairs: TokenPair[] | null;
  spotPrices: Record<string, number | undefined>;
  poolLiquidity: Record<string, number | undefined>;
  transactionState: TransactionState;
  connectionStatus: HashConnectConnectionState;
  sendSwapTransaction: (tokenToTrade: Token, slippageTolerance: number) => Promise<void>;
  getPoolLiquidity: (tokenToTrade: Token, tokenToReceive: Token) => Promise<void>;
  fetchSpotPrices: (selectedAccountId: string) => Promise<void>;
  connectToWallet: () => void;
}

export function SwapTokensForm(props: SwapTokensFormProps) {
  const title = "Swap";
  const swapTokensForm = useForm<SwapTokensFormData>({
    defaultValues: {
      ...InitialSwapFormState,
    },
  });
  const formValues: SwapTokensFormData = structuredClone(swapTokensForm.getValues());
  /**
   * Changes to these form inputs require the form to rerender.
   */
  swapTokensForm.watch([
    "tokenToTrade.displayAmount",
    "tokenToTrade.symbol",
    "tokenToReceive.symbol",
    "tokenToReceive.displayAmount",
    "tokenToTrade.poolLiquidity",
    "tokenToReceive.poolLiquidity",
  ]);

  const selectedPairContractId = formValues.tokenToReceive.tokenMeta.pairAccountId ?? "";
  useSwapData(selectedPairContractId, REFRESH_INTERVAL);
  const formSettings = useFormSettings({ initialSlippage: formValues.slippage });

  const successMessage = `Swapped
  ${formValues.tokenToTrade.amount.toFixed(8)} 
  ${formValues.tokenToTrade.symbol}
for ${formValues.tokenToReceive.amount.toFixed(8)} ${formValues.tokenToReceive.symbol}`;

  const notification = useNotification({ successMessage, transactionState: props.transactionState });

  const spotPrice = getSpotPrice({
    spotPrices: props.spotPrices,
    tokenToTrade: formValues.tokenToTrade,
    tokenToReceive: formValues.tokenToReceive,
  });

  const priceImpact = calculatePriceImpact({
    tokenToTrade: {
      tokenId: formValues.tokenToTrade.tokenMeta.tokenId ?? "",
      amount: formValues.tokenToTrade.amount ?? 0,
      poolLiquidity: formValues.tokenToTrade.poolLiquidity ?? 0,
    },
    tokenToReceive: {
      tokenId: formValues.tokenToReceive.tokenMeta.tokenId ?? "",
      poolLiquidity: formValues.tokenToReceive.poolLiquidity ?? 0,
    },
  });

  const isUserSetSlippageBreached = priceImpact > formSettings.slippage;

  const isSubmitButtonDisabled =
    isEmpty(formValues.tokenToTrade.displayAmount) ||
    isNil(formValues.tokenToTrade.symbol) ||
    isEmpty(formValues.tokenToReceive.displayAmount) ||
    isNil(formValues.tokenToReceive.symbol) ||
    isUserSetSlippageBreached;

  const exchangeRate = getExchangeRateDisplay({
    spotPrice,
    tokenToTradeSymbol: formValues.tokenToTrade.symbol,
    tokenToReceiveSymbol: formValues.tokenToReceive.symbol,
  });

  const tokensPairedWithTradeToken = getPairedTokens(
    formValues.tokenToTrade?.tokenMeta?.tokenId ?? "",
    formValues.tokenToTrade?.tokenMeta?.pairAccountId ?? "",
    props.tokenPairs ?? []
  );

  const tokensAvailableToTrade = getTokensByUniqueAccountIds(props.tokenPairs ?? []);
  const isWalletPaired = props.connectionStatus === HashConnectConnectionState.Paired;

  useEffect(() => {
    const tokenToTradeBalance = getTokenBalance(
      formValues.tokenToTrade.tokenMeta.tokenId ?? "",
      props.pairedAccountBalance
    );
    const tokenToReceiveBalance = getTokenBalance(
      formValues.tokenToReceive.tokenMeta.tokenId ?? "",
      props.pairedAccountBalance
    );
    swapTokensForm.setValue("tokenToTrade.balance", tokenToTradeBalance);
    swapTokensForm.setValue("tokenToReceive.balance", tokenToReceiveBalance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.pairedAccountBalance)]);

  /** Update receive amount based on new liquidity */
  useEffect(() => {
    const tokenToTradeId = formValues.tokenToTrade.tokenMeta.tokenId ?? "";
    const tokenToReceiveId = formValues.tokenToReceive.tokenMeta.tokenId ?? "";
    const areTokensPaired = !isEmpty(tokenToTradeId) && !isEmpty(tokenToReceiveId);
    const updatedTokenToTrade = {
      ...formValues.tokenToTrade,
      poolLiquidity: areTokensPaired ? getPoolLiquidityForTokenId(tokenToTradeId, props.poolLiquidity) : undefined,
    };
    const updatedTokenToReceive = {
      ...formValues.tokenToReceive,
      poolLiquidity: areTokensPaired ? getPoolLiquidityForTokenId(tokenToReceiveId, props.poolLiquidity) : undefined,
    };
    swapTokensForm.setValue("tokenToTrade.poolLiquidity", updatedTokenToTrade.poolLiquidity);
    swapTokensForm.setValue("tokenToReceive.poolLiquidity", updatedTokenToReceive.poolLiquidity);
    if (updatedTokenToTrade.amount > 0) {
      const tokenToReceiveAmount = calculateTokenAmountToReceive({
        tokenToTradeAmount: updatedTokenToTrade.amount,
        tokenToTradeLiquidity: updatedTokenToTrade.poolLiquidity ?? 0,
        tokenToReceiveLiquidity: updatedTokenToReceive.poolLiquidity ?? 0,
      });
      const updatedAmount = tokenToReceiveAmount.toNumber();
      const updatedDisplayAmount = tokenToReceiveAmount.gt(0) ? tokenToReceiveAmount.toString() : "";
      updateTokenToReceiveAmounts(updatedAmount, updatedDisplayAmount);
    } else {
      updateTokenToReceiveAmounts(
        InitialSwapFormState.tokenToReceive.amount,
        InitialSwapFormState.tokenToReceive.displayAmount
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.poolLiquidity]);

  function fetchPoolLiquidity(tokenToTrade: TokenState, tokenToReceive: TokenState) {
    if (tokenToTrade.tokenMeta.tokenId && tokenToReceive.tokenMeta.tokenId) {
      props.getPoolLiquidity(tokenToTrade, tokenToReceive);
    }
  }

  function onSubmit(data: SwapTokensFormData) {
    if (data.tokenToTrade.symbol === undefined || data.tokenToReceive.symbol === undefined) {
      console.error("Token types must be selected to Swap tokens.");
      return;
    }
    props.sendSwapTransaction(data.tokenToTrade, data.slippage);
  }

  /* TODO: Remove after swap queries are replaced with React Query */
  function getSwapConfirmationStep() {
    const { transactionWaitingToBeSigned, successPayload, errorMessage } = props.transactionState;
    return transactionWaitingToBeSigned && !successPayload && !errorMessage
      ? SwapConfirmationStep.SIGN
      : !transactionWaitingToBeSigned && !successPayload && errorMessage
      ? SwapConfirmationStep.ERROR
      : SwapConfirmationStep.CONFIRM;
  }

  function updateTokenToReceiveAmounts(amount: number, displayAmount: string) {
    swapTokensForm.setValue("tokenToReceive.amount", amount);
    swapTokensForm.setValue("tokenToReceive.displayAmount", displayAmount);
  }

  function handleTokenToTradeAmountChanged(updatedToken: TokenState) {
    const tokenToReceiveAmount = calculateTokenAmountToReceive({
      tokenToTradeAmount: updatedToken.amount,
      tokenToTradeLiquidity: updatedToken.poolLiquidity ?? 0,
      tokenToReceiveLiquidity: formValues.tokenToReceive.poolLiquidity ?? 0,
    });
    const updatedTokenToReceive = {
      ...formValues.tokenToReceive,
      amount: tokenToReceiveAmount.toNumber(),
      displayAmount: tokenToReceiveAmount.gt(0) ? String(tokenToReceiveAmount) : "",
    };
    updateTokenToReceiveAmounts(updatedTokenToReceive.amount, updatedTokenToReceive.displayAmount);
  }

  function handleTokenToTradeSymbolChanged(updatedToken: TokenState) {
    swapTokensForm.setValue("tokenToReceive", InitialSwapFormState.tokenToReceive);
  }

  function handleTokenToReceiveSymbolChanged(updatedToken: TokenState) {
    const { tokenToTradeData, tokenToReceiveData } = getPairedTokenData(
      formValues.tokenToTrade.tokenMeta.tokenId ?? "",
      updatedToken.tokenMeta.tokenId ?? "",
      props.tokenPairs ?? []
    );
    const tokenToTradeBalance = getTokenBalance(tokenToTradeData?.tokenMeta.tokenId ?? "", props.pairedAccountBalance);
    const updatedTokenToTrade = {
      ...formValues.tokenToTrade,
      tokenMeta: tokenToTradeData?.tokenMeta ?? formValues.tokenToTrade.tokenMeta,
      symbol: tokenToTradeData?.symbol ?? formValues.tokenToTrade.symbol,
      balance: tokenToTradeBalance,
    };
    swapTokensForm.setValue("tokenToTrade.symbol", updatedTokenToTrade.symbol);
    swapTokensForm.setValue("tokenToTrade.balance", updatedTokenToTrade.balance);
    swapTokensForm.setValue("tokenToTrade.tokenMeta", updatedTokenToTrade.tokenMeta);
    const tokenToReceiveBalance = getTokenBalance(
      tokenToReceiveData?.tokenMeta.tokenId ?? "",
      props.pairedAccountBalance
    );
    const updatedTokenToReceive = {
      ...formValues.tokenToReceive,
      symbol: tokenToReceiveData?.symbol,
      tokenMeta: tokenToReceiveData?.tokenMeta ?? DefaultTokenMeta,
      balance: tokenToReceiveBalance,
    };
    swapTokensForm.setValue("tokenToReceive.symbol", updatedTokenToReceive.symbol);
    swapTokensForm.setValue("tokenToReceive.balance", updatedTokenToReceive.balance);
    swapTokensForm.setValue("tokenToReceive.tokenMeta", updatedTokenToReceive.tokenMeta);
    fetchPoolLiquidity(updatedTokenToTrade, updatedTokenToReceive);
    props.fetchSpotPrices(updatedTokenToReceive.tokenMeta.pairAccountId ?? "");
  }

  function handleSwapTokenInputsClicked() {
    const newTokenToReceive = { ...formValues.tokenToTrade, amount: 0, displayAmount: "" };
    const newTokenToTrade = formValues.tokenToReceive;
    swapTokensForm.setValue("tokenToTrade", { ...newTokenToTrade });
    swapTokensForm.setValue("tokenToReceive", { ...newTokenToReceive });
    fetchPoolLiquidity(newTokenToTrade, newTokenToReceive);
    props.fetchSpotPrices(newTokenToReceive.tokenMeta.pairAccountId ?? "");
    handleTokenToTradeAmountChanged(newTokenToTrade);
  }

  function handleCloseSwapConfirmationButtonClicked() {
    notification.setIsNotificationVisible(true);
  }

  return (
    <form onSubmit={swapTokensForm.handleSubmit(onSubmit)} id="swap-tokens-form">
      <DefiFormLayout
        title={<Text textStyle="h2">{title}</Text>}
        settingsButton={
          <SettingsButton
            isError={isUserSetSlippageBreached}
            slippage={formSettings.slippage}
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
            isSlippageBreached={isUserSetSlippageBreached}
            isSettingsOpen={formSettings.isSettingsOpen}
            handleSlippageChanged={formSettings.handleSlippageChanged}
            handleTransactionDeadlineChanged={formSettings.handleTransactionDeadlineChanged}
            register={swapTokensForm.register}
          />
        }
        isSettingsOpen={formSettings.isSettingsOpen}
        formInputs={[
          <TokenInput
            form={swapTokensForm}
            label="Token To Trade"
            fieldValue="tokenToTrade"
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={formValues.tokenToTrade.tokenMeta.tokenId ?? ""}
            selectableTokens={tokensAvailableToTrade}
            tokenPairs={props.tokenPairs ?? []}
            isHalfAndMaxButtonsVisible={true}
            isLoading={props.isLoading}
            onTokenAmountChanged={handleTokenToTradeAmountChanged}
            onTokenSymbolChanged={handleTokenToTradeSymbolChanged}
            onSetInputAmountWithFormula={handleTokenToTradeAmountChanged}
          />,
          <Flex direction="column" justifyContent="center" alignItems="end">
            <SwitchTokenButton onClick={handleSwapTokenInputsClicked} />
          </Flex>,
          <TokenInput
            form={swapTokensForm}
            label="Token To Receive"
            fieldValue="tokenToReceive"
            isReadOnly={true}
            walletConnectionStatus={props.connectionStatus}
            pairedAccountBalance={props.pairedAccountBalance}
            selectedTokenId={formValues.tokenToReceive.tokenMeta.tokenId ?? ""}
            selectableTokens={tokensPairedWithTradeToken}
            isLoading={props.isLoading}
            tokenPairs={props.tokenPairs ?? []}
            onTokenSymbolChanged={handleTokenToReceiveSymbolChanged}
          />,
        ]}
        metrics={[
          <MetricLabel label="Transaction Fee" value={props.fee} isLoading={props.isLoading} />,
          <MetricLabel label="Price Impact" value={`${priceImpact.toFixed(2)}%`} isLoading={props.isLoading} />,
          <MetricLabel label="Exchange Rate" value={exchangeRate} isLoading={props.isLoading} />,
        ]}
        actionButtonNotifications={
          isUserSetSlippageBreached && (
            <Notification
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message="The price impact is over the set slippage tolerance."
            />
          )
        }
        actionButtons={
          isWalletPaired ? (
            <SwapConfirmation
              tokenToTrade={formValues.tokenToTrade}
              tokenToReceive={formValues.tokenToReceive}
              slippage={String(formSettings.slippage)}
              transactionDeadline={String(formSettings.transactionDeadline)}
              spotPrice={spotPrice}
              isSubmitButtonDisabled={isSubmitButtonDisabled}
              onSubmit={swapTokensForm.handleSubmit(onSubmit)}
              confirmationStep={getSwapConfirmationStep()}
              errorMessage={props.transactionState.errorMessage}
              onClose={handleCloseSwapConfirmationButtonClicked}
            />
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
