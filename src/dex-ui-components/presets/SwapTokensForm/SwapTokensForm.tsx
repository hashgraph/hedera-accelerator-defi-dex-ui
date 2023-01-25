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
  getPoolLiquidityForTokenSymbol,
  getPriceImpact,
  getReceivedAmount,
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
  sendSwapTransaction: (tokenToTrade: Token) => Promise<void>;
  getPoolLiquidity: (tokenToTrade: Token, tokenToReceive: Token) => Promise<void>;
  getSpotPrices: (selectedAccountId: string, selectedAToBRoute: string, selectedBToARoute: string) => Promise<void>;
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
  swapTokensForm.watch("tokenToTrade.displayAmount");
  swapTokensForm.watch("tokenToTrade.symbol");
  swapTokensForm.watch("tokenToReceive.symbol");
  const selectedRoute = {
    selectedPairId: formValues.tokenToReceive.tokenMeta.pairAccountId,
    selectedAToBRoute: `${formValues.tokenToTrade.tokenMeta.tokenId}=>${formValues.tokenToReceive.tokenMeta.tokenId}`,
    selectedBToARoute: `${formValues.tokenToReceive.tokenMeta.tokenId}=>${formValues.tokenToTrade.tokenMeta.tokenId}`,
  };
  useSwapData(selectedRoute, REFRESH_INTERVAL);
  const formSettings = useFormSettings({ initialSlippage: formValues.slippage });

  const successMessage = `Swapped
  ${formValues.tokenToTrade.amount.toFixed(6)} 
  ${formValues.tokenToTrade.symbol}
for ${formValues.tokenToReceive.amount.toFixed(6)} ${formValues.tokenToReceive.symbol}`;

  const notification = useNotification({ successMessage, transactionState: props.transactionState });

  const isSubmitButtonDisabled =
    isEmpty(formValues.tokenToTrade.displayAmount) ||
    isNil(formValues.tokenToTrade.symbol) ||
    isEmpty(formValues.tokenToReceive.displayAmount) ||
    isNil(formValues.tokenToReceive.symbol);

  const spotPrice = getSpotPrice({
    spotPrices: props.spotPrices,
    tokenToTrade: formValues.tokenToTrade,
    tokenToReceive: formValues.tokenToReceive,
  });

  const priceImpact = getPriceImpact({
    spotPrice,
    tokenToTrade: formValues.tokenToTrade,
    tokenToReceive: formValues.tokenToReceive,
  });

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
    const updatedTokenToTrade = {
      ...formValues.tokenToTrade,
      poolLiquidity: getPoolLiquidityForTokenSymbol(formValues.tokenToTrade.symbol, props.poolLiquidity),
    };
    const updatedTokenToReceive = {
      ...formValues.tokenToReceive,
      poolLiquidity: getPoolLiquidityForTokenSymbol(formValues.tokenToReceive.symbol, props.poolLiquidity),
    };
    swapTokensForm.setValue("tokenToTrade.poolLiquidity", updatedTokenToTrade.poolLiquidity);
    swapTokensForm.setValue("tokenToReceive.poolLiquidity", updatedTokenToReceive.poolLiquidity);
    if (updatedTokenToTrade.amount > 0) {
      const tokenToReceiveAmount = getReceivedAmount(updatedTokenToTrade, updatedTokenToReceive);
      swapTokensForm.setValue("tokenToReceive.amount", tokenToReceiveAmount || 0);
      swapTokensForm.setValue("tokenToReceive.displayAmount", tokenToReceiveAmount ? String(tokenToReceiveAmount) : "");
      // forces render to show spot price
      swapTokensForm.setValue("tokenToTrade.displayAmount", updatedTokenToTrade.displayAmount);
    } else {
      swapTokensForm.setValue("tokenToReceive.amount", InitialSwapFormState.tokenToReceive.amount);
      swapTokensForm.setValue("tokenToReceive.displayAmount", InitialSwapFormState.tokenToReceive.displayAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.poolLiquidity)]);

  function fetchPoolLiquidity(tokenToTrade: TokenState, tokenToReceive: TokenState) {
    if (tokenToTrade.symbol && tokenToReceive.symbol) {
      props.getPoolLiquidity(tokenToTrade, tokenToReceive);
    }
  }

  interface FetchSpotPricesParams {
    pairAccountId: string;
    tokenToTradeId?: string;
    tokenToReceiveId?: string;
  }

  function fetchSpotPrices({ pairAccountId, tokenToTradeId, tokenToReceiveId }: FetchSpotPricesParams) {
    const selectedPairId = pairAccountId;
    const selectedAToBRoute = `${tokenToTradeId}=>${tokenToReceiveId}`;
    const selectedBToARoute = `${tokenToReceiveId}=>${tokenToTradeId}`;
    props.getSpotPrices(selectedPairId, selectedAToBRoute, selectedBToARoute);
  }

  function onSubmit(data: SwapTokensFormData) {
    if (data.tokenToTrade.symbol === undefined || data.tokenToReceive.symbol === undefined) {
      console.error("Token types must be selected to Swap tokens.");
      return;
    }
    props.sendSwapTransaction(data.tokenToTrade);
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

  function handleTokenToTradeAmountChanged(updatedToken: TokenState) {
    const tokenToReceiveAmount = getReceivedAmount(updatedToken, formValues.tokenToReceive);
    const updatedTokenToReceive = {
      ...formValues.tokenToReceive,
      amount: tokenToReceiveAmount || 0,
      displayAmount: tokenToReceiveAmount ? String(tokenToReceiveAmount) : "",
    };
    swapTokensForm.setValue("tokenToReceive.amount", updatedTokenToReceive.amount);
    swapTokensForm.setValue("tokenToReceive.displayAmount", updatedTokenToReceive.displayAmount);
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
    fetchPoolLiquidity(updatedTokenToTrade, updatedToken);
    fetchSpotPrices({
      pairAccountId: updatedTokenToReceive.tokenMeta.pairAccountId ?? "",
      tokenToTradeId: updatedTokenToTrade.tokenMeta.tokenId,
      tokenToReceiveId: updatedTokenToReceive.tokenMeta.tokenId,
    });
  }

  function handleSetTokenToTradeAmountWithFormula(updatedToken: TokenState) {
    const tokenToReceiveAmount = getReceivedAmount(updatedToken, formValues.tokenToReceive);
    const updatedTokenToReceive = {
      ...formValues.tokenToReceive,
      amount: tokenToReceiveAmount || 0,
      displayAmount: tokenToReceiveAmount ? String(tokenToReceiveAmount) : "",
    };
    swapTokensForm.setValue("tokenToReceive.amount", updatedTokenToReceive.amount);
    swapTokensForm.setValue("tokenToReceive.displayAmount", updatedTokenToReceive.displayAmount);
  }

  function handleSwapTokenInputsClicked() {
    const newTokenToReceive = { ...formValues.tokenToTrade, amount: 0, displayAmount: "" };
    const newTokenToTrade = formValues.tokenToReceive;
    swapTokensForm.setValue("tokenToTrade", { ...newTokenToTrade });
    swapTokensForm.setValue("tokenToReceive", { ...newTokenToReceive });
    fetchPoolLiquidity(newTokenToTrade, newTokenToReceive);
    fetchSpotPrices({
      pairAccountId: newTokenToReceive.tokenMeta.pairAccountId ?? "",
      tokenToTradeId: newTokenToTrade.tokenMeta.tokenId,
      tokenToReceiveId: newTokenToReceive.tokenMeta.tokenId,
    });
  }

  function handleCloseSwapConfirmationButtonClicked() {
    notification.setIsNotificationVisible(true);
  }

  return (
    <form onSubmit={swapTokensForm.handleSubmit(onSubmit)} id="swap-tokens-form">
      <DefiFormLayout
        title={<Text textStyle="h2">{title}</Text>}
        settingsButton={
          <SettingsButton slippage={formSettings.slippage} onClick={formSettings.handleSettingsButtonClicked} />
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
            onSetInputAmountWithFormula={handleSetTokenToTradeAmountWithFormula}
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
          <MetricLabel label="Price Impact" value={priceImpact} isLoading={props.isLoading} />,
          <MetricLabel label="Exchange Rate" value={exchangeRate} isLoading={props.isLoading} />,
        ]}
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
