import { Text, Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  MetricLabel,
  SettingsButton,
  SwitchTokenButton,
  Notification,
  NotficationTypes,
  useNotification,
} from "../../components";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { TransactionState } from "@dex/store";
import { DefiFormLayout } from "../layouts";
import { SwapTokensFormData, Token, TokenPair } from "./types";
import { TokenState } from "../types";
import { useEffect } from "react";
import { SwapConfirmation, SwapConfirmationStep } from "./SwapConfirmation";
import { TokenInput } from "../TokenInput";
import {
  getExchangeRateDisplay,
  getPairedTokens,
  getPoolLiquidityForTokenId,
  getSpotPrice,
  getTokenBalance,
  getTokensByUniqueAccountIds,
  getSwapPairData,
  getSwapFee,
  getPriceImpact,
} from "@shared/utils";
import { InitialTokenState } from "../constants";
import { InitialSwapFormState } from "./constants";
import { isEmpty, isNil } from "ramda";
import { useSwapData } from "@dex/hooks";
import { REFRESH_INTERVAL } from "@dex/hooks/constants";
import { FormSettings, useFormSettings } from "../FormSettings";
import { convertNumberOfMinsToSeconds } from "@dex/utils";
import { PairDataResponse } from "@dex/hooks/swap/types";

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
  swapPairData: PairDataResponse | undefined;
  fetchPairForSwap: (tokenAAddress: string, tokenBAddress: string, tokenAQty: number) => Promise<void>;
  sendSwapTransaction: (
    tokenToTrade: Token,
    slippageTolerance: number,
    transactionDeadline: number,
    tokenToReceiveId: string
  ) => Promise<void>;
  getPoolLiquidity: (tokenToTrade: Token, tokenToReceive: Token) => Promise<void>;
  fetchPairInfo: (selectedAccountId: string) => Promise<void>;
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

  const { swapPairData } = props;
  const selectedPairContractId = swapPairData?.pair ?? "";
  useSwapData(selectedPairContractId, REFRESH_INTERVAL);

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

  const transactionFee = getSwapFee({
    tokenAId: formValues.tokenToTrade.tokenMeta.tokenId,
    tokenBId: formValues.tokenToReceive.tokenMeta.tokenId,
    fee: props.fee,
  });

  const priceImpact = getPriceImpact({
    tokenToTradeAmount: formValues.tokenToTrade.amount,
    tokenToReceiveAmount: formValues.tokenToReceive.amount,
    slippage: swapPairData?.slippage.toNumber(),
  });

  const formSettings = useFormSettings({
    slippage: formValues.slippage,
    priceImpact: priceImpact,
    transactionDeadline: formValues.transactionDeadline,
  });

  const isSubmitButtonDisabled =
    isEmpty(formValues.tokenToTrade.displayAmount) ||
    isNil(formValues.tokenToTrade.symbol) ||
    isEmpty(formValues.tokenToReceive.displayAmount) ||
    isNil(formValues.tokenToReceive.symbol) ||
    formSettings.isUserSetSlippageBreached ||
    !formSettings.isTransactionDeadlineValid;

  const exchangeRate = getExchangeRateDisplay({
    spotPrice,
    tokenToTradeSymbol: formValues.tokenToTrade.symbol,
    tokenToReceiveSymbol: formValues.tokenToReceive.symbol,
  });

  const tokensPairedWithTradeToken = getPairedTokens(
    formValues.tokenToTrade?.tokenMeta?.tokenId ?? "",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.poolLiquidity]);

  useEffect(() => {
    const swapQty = swapPairData?.swappedQty.toNumber() ?? 0;
    if (swapQty > 0) {
      updateTokenToReceiveAmounts(swapQty ?? 0, `${swapQty ?? 0}`);
      const { tokenToTradeData, tokenToReceiveData } = getSwapPairData(
        swapPairData?.pair ?? "",
        props.tokenPairs ?? [],
        swapPairData?.token ?? ""
      );
      const tokenToTradeBalance = getTokenBalance(
        tokenToTradeData?.tokenMeta.tokenId ?? "",
        props.pairedAccountBalance
      );
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
      props.fetchPairInfo(updatedTokenToReceive.tokenMeta.pairAccountId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapPairData]);

  function fetchPoolLiquidity(tokenToTrade: TokenState, tokenToReceive: TokenState) {
    if (tokenToTrade.tokenMeta.tokenId && tokenToReceive.tokenMeta.tokenId) {
      props.getPoolLiquidity(tokenToTrade, tokenToReceive);
    }
  }

  function fetchSwapPair(tokenAAddress: string, tokenBAddress: string, tokenAQty: number) {
    props.fetchPairForSwap(tokenAAddress, tokenBAddress, tokenAQty);
  }

  function onSubmit(data: SwapTokensFormData) {
    if (data.tokenToTrade.symbol === undefined || data.tokenToReceive.symbol === undefined) {
      console.error("Token types must be selected to Swap tokens.");
      return;
    }
    const transactionDeadlineInSeconds = convertNumberOfMinsToSeconds(data.transactionDeadline);
    props.sendSwapTransaction(
      data.tokenToTrade,
      data.slippage,
      transactionDeadlineInSeconds,
      data.tokenToReceive.tokenMeta.tokenId ?? ""
    );
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
    const tokenToTradeQty = updatedToken.amount;
    if (tokenToTradeQty) {
      fetchSwapPair(
        updatedToken.tokenMeta.tokenId ?? "",
        formValues.tokenToReceive.tokenMeta.tokenId ?? "",
        updatedToken.amount === 0 ? 1 : updatedToken.amount
      );
    } else {
      swapTokensForm.setValue("tokenToReceive.amount", 0);
      swapTokensForm.setValue("tokenToReceive.displayAmount", "");
    }
  }

  function handleTokenToTradeSymbolChanged(_updatedToken: TokenState) {
    swapTokensForm.setValue("tokenToReceive", InitialSwapFormState.tokenToReceive);
  }

  function handleTokenToReceiveSymbolChanged(updatedToken: TokenState) {
    fetchSwapPair(
      formValues.tokenToTrade.tokenMeta.tokenId ?? "",
      updatedToken.tokenMeta.tokenId ?? "",
      formValues.tokenToTrade.amount === 0 ? 1 : formValues.tokenToTrade.amount
    );

    /* TODO: This is done as a design approach with SC team meanwhile 
    SC team is trying merge fetchPairInfo and SwapPairFetch into single one. */

    if (formValues.tokenToTrade.amount === 0) {
      swapTokensForm.setValue("tokenToTrade.amount", 1);
      swapTokensForm.setValue("tokenToTrade.displayAmount", "1");
    }
  }

  function handleSwapTokenInputsClicked() {
    const newTokenToReceive = { ...formValues.tokenToTrade, amount: 0, displayAmount: "" };
    const newTokenToTrade = formValues.tokenToReceive;
    swapTokensForm.setValue("tokenToTrade", { ...newTokenToTrade });
    swapTokensForm.setValue("tokenToReceive", { ...newTokenToReceive });
    fetchSwapPair(
      newTokenToTrade.tokenMeta.tokenId ?? "",
      newTokenToReceive.tokenMeta.tokenId ?? "",
      newTokenToTrade.amount === 0 ? 1 : newTokenToTrade.amount
    );
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
            isError={formSettings.isUserSetSlippageBreached || !formSettings.isTransactionDeadlineValid}
            display={formSettings.formattedSlippage}
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
            isSlippageBreached={formSettings.isUserSetSlippageBreached}
            isSettingsOpen={formSettings.isSettingsOpen}
            isTransactionDeadlineValid={formSettings.isTransactionDeadlineValid}
            initialSlippage={`${formSettings.slippage}`}
            initialTransactionDeadline={`${formSettings.transactionDeadline}`}
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
            key="tokeninput"
          />,
          <Flex direction="column" justifyContent="center" alignItems="end" key="flex">
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
            key="tokeninput2"
          />,
        ]}
        metrics={[
          <MetricLabel label="Transaction Fee" value={transactionFee} isLoading={props.isLoading} key="1" />,
          <MetricLabel label="Price Impact" value={`${priceImpact.toFixed(2)}%`} isLoading={props.isLoading} key="2" />,
          <MetricLabel label="Exchange Rate" value={exchangeRate} isLoading={props.isLoading} key="3" />,
        ]}
        actionButtonNotifications={[
          !formSettings.isTransactionDeadlineValid ? (
            <Notification
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message={formSettings.transactionDeadlineErrorMessage}
            />
          ) : null,
          formSettings.isUserSetSlippageBreached ? (
            <Notification
              type={NotficationTypes.ERROR}
              textStyle="b3"
              message={formSettings.slippageBreachedErrorMessage}
            />
          ) : null,
        ].filter((notification: React.ReactNode) => !isNil(notification))}
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
