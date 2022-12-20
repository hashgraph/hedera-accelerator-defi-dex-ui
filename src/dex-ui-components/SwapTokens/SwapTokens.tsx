import { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";
import { ChakraProvider, Box, Heading, Flex, Spacer, Text, Collapse } from "@chakra-ui/react";
import { SettingsIcon, UpDownIcon } from "@chakra-ui/icons";
import { HashConnectTypes } from "hashconnect";
import { DEXTheme } from "../../dex-ui/DEX";
import { swapReducer, initialSwapState, initSwapReducer } from "./reducers";
import {
  setTokenToTradeAmount,
  setTokenToTradeDisplayAmount,
  setTokenToTradeSymbol,
  setTokenToTradeMeta,
  setTokenToReceiveMeta,
  setTokenToTradeBalance,
  setTokenToReceiveAmount,
  setTokenToReceiveDisplayAmount,
  setTokenToReceiveSymbol,
  setTokenToReceiveBalance,
  swapTokenToTradeAndReceive,
  setSpotPrice,
  setTokenToTradePoolLiquidity,
  setTokenToReceivePoolLiquidity,
  setSlippageSetting,
  setTransactionDeadlineSetting,
} from "./actions/swapActions";
import { Button, IconButton, MetricLabel, NotficationTypes, Notification, SwapSettingsInput } from "../base";
import { TokenInput } from "../TokenInput/TokenInput";
import { formulaTypes, TokenPair, Token } from "./types";
import {
  getReceivedAmount,
  getExchangeRateDisplay,
  getPairedTokens,
  getPriceImpact,
  getSwapSettingsProps,
  getTokenBalance,
  getTokensByUniqueAccountIds,
  halfOf,
  getTokenData,
  getTradeTokenMeta,
} from "./utils";
import { SwapConfirmation, SwapConfirmationStep } from "./SwapConfirmation";
import { Networks, WalletStore } from "../../dex-ui/store/walletSlice";
import { TransactionState } from "../../dex-ui/store/swapSlice";
import { AppFeatures } from "../../dex-ui/store/appSlice";
import { createHashScanLink } from "../../dex-ui/utils";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";

export interface SwapTokensProps {
  title: string;
  sendSwapTransaction: (tokenToTrade: Token) => void;
  connectToWallet: () => void;
  connectionStatus: HashConnectConnectionState;
  getPoolLiquidity: (tokenToTrade: Token, tokenToReceive: Token) => void;
  setSelectedAccount: (accountId: string, tokenToTradeAId: string, tokenToTradeBId: string) => void;
  spotPrices: Record<string, number | undefined>;
  fee: string;
  poolLiquidity: Record<string, number | undefined>;
  walletData: WalletStore | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata | null;
  transactionState: TransactionState;
  isFeatureLoading: <T extends AppFeatures>(feature: T) => boolean;
  tokenPairs: TokenPair[] | null;
}

const SwapTokens = (props: SwapTokensProps) => {
  const {
    title,
    spotPrices,
    fee,
    walletData,
    connectionStatus,
    connectToWallet,
    sendSwapTransaction,
    poolLiquidity,
    getPoolLiquidity,
    setSelectedAccount,
    transactionState,
    isFeatureLoading,
    tokenPairs,
  } = props;
  const [swapState, dispatch] = useImmerReducer(swapReducer, initialSwapState, initSwapReducer);
  const { tokenToTrade, tokenToReceive, spotPrice, swapSettings } = swapState;
  const uniqueTokens = getTokensByUniqueAccountIds(tokenPairs ?? []);
  const tokensPairedWithTradeToken = getPairedTokens(
    tokenToTrade?.tokenMeta?.tokenId ?? "",
    tokenToTrade?.tokenMeta?.pairAccountId ?? "",
    tokenPairs ?? []
  );
  console.log(uniqueTokens, tokensPairedWithTradeToken, swapState);
  const [localSwapState, setLocalSwapState] = useState({
    settingsOpen: false,
    showSuccessMessage: false,
    tokenToTradeAmount: 0.0,
    tokenToTradeSymbol: "",
    tokenToReceiveAmount: 0.0,
    tokenToReceiveSymbol: "",
  });

  const onSlippageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSlippageSetting(event.target.value));
    },
    [dispatch]
  );

  const onTransactionDeadlineInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setTransactionDeadlineSetting(event.target.value));
    },
    [dispatch]
  );

  const { slippage, transactionDeadline } = getSwapSettingsProps({
    swapSettings,
    onSlippageInputChange,
    onTransactionDeadlineInputChange,
  });
  const priceImpact = getPriceImpact({ spotPrice, tokenToTrade, tokenToReceive });
  const exchangeRate = getExchangeRateDisplay({
    spotPrice,
    tokenToTradeSymbol: tokenToTrade.symbol,
    tokenToReceiveSymbol: tokenToReceive.symbol,
  });

  // TODO: probably want to use usePrevious instead so we dont need this. right now, without this on symbol change it
  //         updates spot price which then causes logic to run to calculate tokenToReceive amount but it uses the old
  //        liquidity value of whichever token was just selected previously
  useEffect(() => {
    if (swapState.tokenToTrade.amount && swapState.tokenToTrade.symbol !== swapState.tokenToReceive.symbol) {
      const tokenToReceiveAmount = getReceivedAmount(tokenToTrade, tokenToReceive);
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount || 0.0));
      dispatch(setTokenToReceiveDisplayAmount(tokenToReceiveAmount ? String(tokenToReceiveAmount) : "0.0"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapState.tokenToTrade.poolLiquidity, swapState.tokenToReceive.poolLiquidity]);

  useEffect(() => {
    if (spotPrices !== null) {
      const tokenToTradeId = swapState.tokenToTrade.tokenMeta.tokenId || "";
      const tokenToReceiveId = swapState.tokenToReceive.tokenMeta.tokenId || "";
      const route = `${tokenToTradeId}=>${tokenToReceiveId}`;
      if (spotPrices?.[route] !== undefined) {
        const newSpotPrice = spotPrices[route] ?? 0.0;
        dispatch(setSpotPrice(newSpotPrice));
      } else {
        dispatch(setSpotPrice(undefined));
      }
    }
  }, [spotPrices, poolLiquidity]);
  /**
   * Whenever poolLiquidity is updated (ie new pair selected) update
   * poolLiquidity for each token in swapState accordingly
   */
  useEffect(() => {
    if (poolLiquidity !== undefined) {
      const tokenToTradeSymbol = swapState.tokenToTrade.symbol || "";
      const tokenToReceiveSymbol = swapState.tokenToReceive.symbol || "";
      dispatch(setTokenToTradePoolLiquidity(poolLiquidity[tokenToTradeSymbol]));
      dispatch(setTokenToReceivePoolLiquidity(poolLiquidity[tokenToReceiveSymbol]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolLiquidity, dispatch]);

  const updateExchangeRate = useCallback(
    ({ tokenToTradeId = tokenToTrade.tokenMeta.tokenId, tokenToReceiveId = tokenToReceive.tokenMeta.tokenId }) => {
      const route = `${tokenToTradeId}=>${tokenToReceiveId}`;
      if (spotPrices?.[route] !== undefined) {
        const newSpotPrice = spotPrices[route] ?? 0.0;
        dispatch(setSpotPrice(newSpotPrice));
      } else {
        dispatch(setSpotPrice(undefined));
      }
    },
    [dispatch, spotPrices, tokenToTrade.tokenMeta.tokenId, tokenToReceive.tokenMeta.tokenId]
  );

  /** Update token to receive amount any time the token symbols, token to trade amount, or spot price is updated. */
  useEffect(() => {
    if (spotPrice !== undefined) {
      // TODO: check on if we should keep getTokenExcchangeAmount
      // const tokenToReceiveAmount = getTokenExchangeAmount(tokenToTrade.amount, spotPrice);
      const tokenToReceiveAmount = getReceivedAmount(tokenToTrade, tokenToReceive);
      if (!tokenToTrade.amount) {
        dispatch(setTokenToReceiveAmount(0.0));
        dispatch(setTokenToReceiveDisplayAmount("0.0"));
      } else {
        dispatch(setTokenToReceiveAmount(tokenToReceiveAmount || 0.0));
        dispatch(setTokenToReceiveDisplayAmount(tokenToReceiveAmount ? String(tokenToReceiveAmount) : "0.0"));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, spotPrice, tokenToTrade.displayAmount]);

  /** Update balances any time the token symbols or the cached paired account balances change. */
  useEffect(() => {
    if (tokenToTrade.tokenMeta.tokenId !== undefined) {
      const tokenToTradeBalance = getTokenBalance(
        tokenToTrade.tokenMeta.tokenId,
        walletData?.pairedAccountBalance?.tokens ?? []
      );
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));
      if (poolLiquidity !== undefined && tokenToTrade.symbol !== undefined) {
        dispatch(setTokenToTradePoolLiquidity(poolLiquidity?.[tokenToTrade.symbol]));
      }
    }
    if (tokenToReceive.tokenMeta.tokenId !== undefined) {
      const tokenToReceiveBalance = getTokenBalance(
        tokenToReceive.tokenMeta.tokenId,
        walletData?.pairedAccountBalance?.tokens ?? []
      );
      dispatch(setTokenToReceiveBalance(tokenToReceiveBalance));
      if (poolLiquidity !== undefined && tokenToReceive.symbol !== undefined) {
        dispatch(setTokenToReceivePoolLiquidity(poolLiquidity?.[tokenToReceive.symbol]));
      }
    }

    // get pool liquidity for selected symbols
    // TODO: revisit this approach
    if (tokenToTrade.symbol && tokenToReceive.symbol) {
      // TODO: should we use usePrevious here to only make this call when the selected token has changed?
      getPoolLiquidity(tokenToTrade, tokenToReceive);
      setSelectedAccount(
        tokenToReceive.tokenMeta.pairAccountId ?? "",
        tokenToTrade.tokenMeta.tokenId ?? "",
        tokenToReceive.tokenMeta.tokenId ?? ""
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    getTokenBalance,
    tokenToTrade.tokenMeta.tokenId,
    tokenToReceive.tokenMeta.tokenId,
    walletData?.pairedAccountBalance,
  ]);

  const handleTokenToTradeAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToTradeAmount = Number(inputElement.value);
      dispatch(setTokenToTradeAmount(tokenToTradeAmount));
      dispatch(setTokenToTradeDisplayAmount(inputElement.value ?? "0.0"));
    },
    [dispatch]
  );

  const handleTokenToTradeSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToTradeId = inputElement.value;
      const token = getTokenData(tokenToTradeId, tokenPairs ?? []);
      dispatch(setTokenToTradeSymbol(token?.symbol ?? ""));
      dispatch(setTokenToTradeMeta(token?.tokenMeta ?? { pairAccountId: undefined, tokenId: undefined }));
      const tokenToTradeBalance = getTokenBalance(tokenToTradeId, walletData?.pairedAccountBalance?.tokens ?? []);
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));
      updateExchangeRate({ tokenToTradeId: token?.tokenMeta.tokenId ?? undefined });
    },
    [dispatch, getTokenBalance, updateExchangeRate, tokenPairs]
  );

  const handleTokenToReceiveAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToReceiveAmount = Number(inputElement.value);
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount));
      dispatch(setTokenToReceiveDisplayAmount(inputElement.value ?? "0.0"));
    },
    [dispatch]
  );

  const handleTokenToReceiveSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToReceiveId = inputElement.value;
      const tokenToReceive = getTokenData(tokenToReceiveId, tokenPairs ?? []);

      const tokenToTrade = getTradeTokenMeta(
        tokenToReceive?.tokenMeta.tokenId,
        tokenToReceive?.tokenMeta.pairAccountId,
        tokenPairs ?? []
      );

      dispatch(
        setTokenToTradeMeta(tokenToTrade?.tokenMeta ? tokenToTrade?.tokenMeta : swapState.tokenToTrade.tokenMeta)
      );
      const tokenToTradeBalance = getTokenBalance(
        tokenToTrade?.tokenMeta.tokenId ?? "",
        walletData?.pairedAccountBalance?.tokens ?? []
      );
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));

      dispatch(setTokenToReceiveSymbol(tokenToReceive?.symbol ?? ""));
      dispatch(setTokenToReceiveMeta(tokenToReceive?.tokenMeta ?? { pairAccountId: undefined, tokenId: undefined }));
      const tokenToReceiveBalance = getTokenBalance(
        tokenToReceive?.tokenMeta.tokenId ?? "",
        walletData?.pairedAccountBalance?.tokens ?? []
      );
      dispatch(setTokenToReceiveBalance(tokenToReceiveBalance));
      updateExchangeRate({
        tokenToTradeId: tokenToTrade?.tokenMeta.tokenId,
        tokenToReceiveId: tokenToReceive?.tokenMeta.tokenId,
      });
    },
    [dispatch, updateExchangeRate, getTokenBalance, tokenPairs]
  );

  const swapTokens = useCallback(() => {
    dispatch(swapTokenToTradeAndReceive());
    updateExchangeRate({
      tokenToTradeId: tokenToReceive.tokenMeta.tokenId,
      tokenToReceiveId: tokenToTrade.tokenMeta.tokenId,
    });
  }, [dispatch, updateExchangeRate, tokenToReceive.tokenMeta.tokenId, tokenToTrade.tokenMeta.tokenId]);

  const setTokenToTradeAmountWithFormula = useCallback(
    (formula: formulaTypes = formulaTypes.MAX) => {
      if (tokenToTrade.balance === undefined) {
        console.warn("Token To Trade balance is null");
        return;
      }
      const amountToTrade = formula === formulaTypes.MAX ? tokenToTrade.balance : halfOf(tokenToTrade.balance);
      dispatch(setTokenToTradeAmount(amountToTrade));
      dispatch(setTokenToTradeDisplayAmount(String(amountToTrade)));
    },
    [dispatch, tokenToTrade.balance]
  );

  const handleTokenToTradeMaxButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTokenToTradeAmountWithFormula(formulaTypes.MAX);
    },
    [setTokenToTradeAmountWithFormula]
  );

  const handleTokenToTradeHalfButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTokenToTradeAmountWithFormula(formulaTypes.HALF);
    },
    [setTokenToTradeAmountWithFormula]
  );

  const getSwapConfirmationStep = useCallback(() => {
    // TODO: we aren't able to tell when the transaction is actually being processed (after signing)
    //       but if and when we are need to add logic for that SwapConfirmationStep
    const { transactionWaitingToBeSigned, successPayload, errorMessage } = transactionState;
    return transactionWaitingToBeSigned && !successPayload && !errorMessage
      ? SwapConfirmationStep.SIGN
      : !transactionWaitingToBeSigned && !successPayload && errorMessage
      ? SwapConfirmationStep.ERROR
      : SwapConfirmationStep.CONFIRM;
  }, [transactionState]);

  const onSwapButtonClick = useCallback(() => {
    setLocalSwapState({
      ...localSwapState,
      tokenToTradeAmount: swapState.tokenToTrade.amount,
      tokenToTradeSymbol: swapState.tokenToTrade.symbol ?? "",
      tokenToReceiveAmount: swapState.tokenToReceive.amount,
      tokenToReceiveSymbol: swapState.tokenToReceive.symbol ?? "",
    });
  }, [localSwapState, swapState]);

  return (
    <ChakraProvider theme={DEXTheme}>
      <Box
        data-testid="swap-component"
        bg="white"
        borderRadius="15px"
        width="400px"
        padding="0.5rem 1rem 1rem 1rem"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.15)"
      >
        <Flex alignItems={"center"} marginBottom={"8px"}>
          <Heading as="h4" fontWeight="500" size="lg">
            {title}
          </Heading>
          <Spacer />
          <Button
            leftIcon={<SettingsIcon w={5} h={5} color={"#000000"} />}
            padding={"6px 12px"}
            backgroundColor={"#F2F2F2"}
            border={"1px solid #000000"}
            height={"32px"}
            data-testid="settings-button"
            aria-label="Open and close settings modal."
            onClick={() => setLocalSwapState({ ...localSwapState, settingsOpen: !localSwapState.settingsOpen })}
          >
            <Text color={"#4D4D4D"}>{(+swapSettings.slippage).toFixed(1)}%</Text>
          </Button>
        </Flex>
        <Collapse in={localSwapState.settingsOpen} animateOpacity>
          <Flex
            width={"100%"}
            padding={"8px"}
            marginBottom={"8px"}
            borderRadius={"8px"}
            backgroundColor={"#F2F2F2"}
            justifyContent={"space-between"}
          >
            <SwapSettingsInput {...slippage} />
            <SwapSettingsInput {...transactionDeadline} />
          </Flex>
        </Collapse>
        {transactionState.successPayload &&
        !transactionState.errorMessage &&
        !transactionState.transactionWaitingToBeSigned &&
        localSwapState.showSuccessMessage ? (
          <>
            <Spacer margin="0.25rem 0rem" />
            <Notification
              type={NotficationTypes.SUCCESS}
              textStyle={"b3"}
              message={`Swapped
              ${Number(localSwapState.tokenToTradeAmount.toFixed(6))} 
              ${localSwapState.tokenToTradeSymbol}
          for ${Number(localSwapState.tokenToReceiveAmount.toFixed(6))} ${localSwapState.tokenToReceiveSymbol}`}
              isLinkShown={true}
              linkText="View in HashScan"
              linkRef={createHashScanLink(transactionState.successPayload?.transactionId.toString())}
              isCloseButtonShown={true}
              handleClickClose={() => setLocalSwapState({ ...localSwapState, showSuccessMessage: false })}
            />
            <Spacer margin="0.5rem 0rem" />
          </>
        ) : (
          <></>
        )}
        <TokenInput
          data-testid="token-to-trade-component"
          title="Token To Trade"
          tokenAmount={tokenToTrade.displayAmount}
          tokenSymbol={tokenToTrade.symbol}
          tokenBalance={tokenToTrade.balance}
          tokenId={tokenToTrade.tokenMeta.tokenId}
          walletConnectionStatus={connectionStatus}
          onTokenAmountChange={handleTokenToTradeAmountChange}
          onTokenSymbolChange={handleTokenToTradeSymbolChange}
          isHalfAndMaxButtonsVisible={true}
          tokenPairs={uniqueTokens}
          onMaxButtonClick={handleTokenToTradeMaxButtonClick}
          onHalfButtonClick={handleTokenToTradeHalfButtonClick}
          isLoading={isFeatureLoading("pairedAccountBalance")}
        />
        <Flex>
          <Spacer />
          <IconButton
            data-testid="switch-token-inputs-button"
            aria-label="Switch the token amount and symbol input values."
            icon={<UpDownIcon w={6} h={6} />}
            onClick={swapTokens}
            isRound={true}
            variant="switch-token-inputs"
          />
          <Spacer />
        </Flex>
        <TokenInput
          data-testid="token-to-receive-component"
          isDisabled={true}
          title="Token To Receive"
          tokenAmount={tokenToReceive.displayAmount}
          tokenSymbol={tokenToReceive.symbol}
          tokenBalance={tokenToReceive.balance}
          tokenId={tokenToReceive.tokenMeta.tokenId}
          walletConnectionStatus={connectionStatus}
          tokenPairs={tokensPairedWithTradeToken}
          onTokenAmountChange={handleTokenToReceiveAmountChange}
          onTokenSymbolChange={handleTokenToReceiveSymbolChange}
          isLoading={isFeatureLoading("pairedAccountBalance")}
        />
        <Flex paddingTop="1rem">
          <Box flex="2" paddingRight="1rem">
            <MetricLabel label="Transaction Fee" value={fee} isLoading={isFeatureLoading("fee")} />
          </Box>
          <Box flex="2" paddingRight="1rem">
            <MetricLabel label="Price Impact" value={priceImpact} isLoading={isFeatureLoading("spotPrices")} />
          </Box>
          <Box flex="4">
            <MetricLabel label="Swap Exchange Rate" value={exchangeRate} isLoading={isFeatureLoading("spotPrices")} />
          </Box>
        </Flex>
        <Flex direction="column" grow="1" paddingTop="1.25rem">
          {connectionStatus === HashConnectConnectionState.Paired ? (
            <SwapConfirmation
              sendSwapTransaction={sendSwapTransaction}
              swapState={swapState}
              confirmationStep={getSwapConfirmationStep()}
              errorMessage={transactionState.errorMessage}
              onSwapButtonClick={onSwapButtonClick}
              onClose={() => setLocalSwapState({ ...localSwapState, showSuccessMessage: true })}
            />
          ) : (
            <Button data-testid="connect-wallet-button" marginTop="0.5rem" onClick={connectToWallet}>
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export { SwapTokens };
