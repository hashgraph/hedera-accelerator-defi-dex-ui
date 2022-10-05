import { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";
import { ChakraProvider, Box, Heading, Flex, Spacer, Text, Collapse } from "@chakra-ui/react";
import { SettingsIcon, UpDownIcon } from "@chakra-ui/icons";
import { HashConnectTypes } from "hashconnect";
import { WalletConnectionStatus, Networks } from "../../hooks/useHashConnect";
import { HederaOpenDexTheme } from "../../HederaOpenDEX/styles";
import { swapReducer, initialSwapState, initSwapReducer } from "./reducers";
import {
  setTokenToTradeAmount,
  setTokenToTradeSymbol,
  setTokenToTradeBalance,
  setTokenToReceiveAmount,
  setTokenToReceiveSymbol,
  setTokenToReceiveBalance,
  swapTokenToTradeAndReceive,
  setSpotPrice,
  setTokenToTradePoolLiquidity,
  setTokenToReceivePoolLiquidity,
} from "./actions/swapActions";
import { Button, IconButton, SwapConfirmation, SwapSettingsInput, SwapSettingsInputProps } from "../base";
import { TokenInput } from "../TokenInput/TokenInput";
import { formulaTypes } from "./types";
import { halfOf } from "./utils";
import { TOKEN_SYMBOL_TO_ACCOUNT_ID } from "../../hooks";
export interface SwapProps {
  title: string;
  sendSwapTransaction: (payload: any) => void;
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  fetchSpotPrices: () => void;
  getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) => void;
  connectionStatus: WalletConnectionStatus;
  spotPrices: Map<string, number | undefined> | undefined;
  poolLiquidity: Map<string, number | undefined> | undefined;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const Swap = (props: SwapProps) => {
  const {
    title,
    spotPrices,
    walletData,
    connectionStatus,
    connectToWallet,
    sendSwapTransaction,
    poolLiquidity,
    getPoolLiquidity,
  } = props;
  const [swapState, dispatch] = useImmerReducer(swapReducer, initialSwapState, initSwapReducer);
  const { tokenToTrade, tokenToReceive, spotPrice } = swapState;

  // TODO: check if we want to use a local state for slippage and transactionDeadline
  //       or if we want to add to SwapState
  const [localSwapState, setLocalSwapState] = useState({
    settingsOpen: false,
    slippage: "2.0",
    transactionDeadline: "3",
  });

  const onSlippageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLocalSwapState({ ...localSwapState, slippage: event.target.value });
    },
    [localSwapState]
  );

  const onTransactionDeadlineInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLocalSwapState({ ...localSwapState, transactionDeadline: event.target.value });
    },
    [localSwapState]
  );

  const swapSettingsProps = useCallback((): { [key: string]: SwapSettingsInputProps } => {
    return {
      slippage: {
        label: "Slippage",
        popoverText: `Slippage refers to the difference between the expected 
    price of a trade and the price at which the trade is executed.`,
        inputUnit: "%",
        onInputChange: onSlippageInputChange,
        value: localSwapState.slippage,
      },
      transactionDeadline: {
        label: "Transaction Deadline",
        popoverText: `If your transaction is not completed within the deadline, it will revert and your coins
    (less the fee) will be returned to you.`,
        inputUnit: "min",
        onInputChange: onTransactionDeadlineInputChange,
        value: localSwapState.transactionDeadline,
      },
    };
  }, [localSwapState, onSlippageInputChange, onTransactionDeadlineInputChange]);

  // TODO: probably want to use usePrevious instead so we dont need this. right now, without this on symbol change it
  //         updates spot price which then causes logic to run to calculate tokenToReceive amount but it uses the old
  //        liquidity value of whichever token was just selected previously
  useEffect(() => {
    if (swapState.tokenToTrade.amount && swapState.tokenToTrade.symbol !== swapState.tokenToReceive.symbol) {
      const tokenToReceiveAmount = getReceivedAmount(tokenToTrade.amount);
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount || 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapState.tokenToTrade.poolLiquidity, swapState.tokenToReceive.poolLiquidity]);

  /**
   * Whenever poolLiquidity is updated (ie new pair selected) update
   * poolLiquidity for each token in swapState accordingly
   */
  useEffect(() => {
    if (poolLiquidity !== undefined && poolLiquidity instanceof Map) {
      const tokenToTradeSymbol = swapState.tokenToTrade.symbol || "";
      const tokenToReceiveSymbol = swapState.tokenToReceive.symbol || "";
      dispatch(setTokenToTradePoolLiquidity(poolLiquidity.get(tokenToTradeSymbol)));
      dispatch(setTokenToReceivePoolLiquidity(poolLiquidity.get(tokenToReceiveSymbol)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolLiquidity, dispatch]);

  /**
   * Gets price impact based on liquidity values in pool
   * before and after proposed swap
   */
  const priceImpact = useCallback(() => {
    if (
      swapState.tokenToTrade.poolLiquidity &&
      swapState.tokenToReceive.poolLiquidity &&
      swapState.tokenToTrade.amount &&
      swapState.tokenToReceive.amount &&
      swapState.tokenToTrade.symbol !== swapState.tokenToReceive.symbol
    ) {
      const amountReceived = getReceivedAmount(swapState.tokenToTrade.amount) || 1;
      const newSpotPrice = amountReceived / swapState.tokenToTrade.amount;
      const _priceImpact = ((swapState.spotPrice || 1) / newSpotPrice - 1) * 100;
      return `${_priceImpact.toFixed(2)}%`;
    } else {
      return "--";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    swapState.tokenToTrade.poolLiquidity,
    swapState.tokenToReceive.poolLiquidity,
    swapState.tokenToTrade.amount,
    swapState.tokenToReceive.amount,
    swapState.tokenToTrade.symbol,
    swapState.tokenToReceive.symbol,
  ]);

  const getTokenBalance = useCallback(
    (tokenSymbol: string): number => {
      if (tokenSymbol === "HBAR") {
        return walletData?.pairedAccountBalance?.hbars.replace("ℏ", "").trim();
      }
      const defaultBalance = 0.0;
      const tokenBalances = walletData?.pairedAccountBalance?.tokens;
      const tokenId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenSymbol);
      return tokenBalances?.find((tokenData: any) => tokenData.tokenId === tokenId)?.balance ?? defaultBalance;
    },
    [walletData]
  );

  const updateExchangeRate = useCallback(
    ({ tokenToTradeSymbol = tokenToTrade.symbol, tokenToReceiveSymbol = tokenToReceive.symbol }) => {
      const route = `${tokenToTradeSymbol}=>${tokenToReceiveSymbol}`;
      if (spotPrices !== undefined && spotPrices instanceof Map && spotPrices.has(route)) {
        const newSpotPrice = spotPrices.get(route) ?? 0.0;
        dispatch(setSpotPrice(newSpotPrice));
      } else {
        dispatch(setSpotPrice(undefined));
      }
    },
    [dispatch, spotPrices, tokenToTrade.symbol, tokenToReceive.symbol]
  );

  /**
   * Calculates the token to receive amount based on the tokenToTradeAmount input.
   * Follows the x*y=K formula where x and y are the amounts of each token's liquidity.
   * K remains constant after a transaction, so it is safe to assume (post trade)
   * newX*newY = K. Therefore, taking the tokenToTradeAmount and adding it to the current
   * liquidity of the tokenToTrade in the pool, we get "newX". Taking k/newX, we can compute
   * newY. We then subtract the newY from the current liquidty of Y to get the tokenToReceive amount
   */
  const getReceivedAmount = useCallback(
    (tokenToTradeAmount: number) => {
      if (tokenToTrade.poolLiquidity && tokenToReceive.poolLiquidity) {
        // TODO: pull k from contract?
        const k = tokenToTrade.poolLiquidity * tokenToReceive.poolLiquidity;
        const postSwapTokenToTradeLiquidity = tokenToTrade?.poolLiquidity + tokenToTradeAmount;
        const postSwapTokenToReceiveLiquidity = k / postSwapTokenToTradeLiquidity;
        const amountToReceive = tokenToReceive.poolLiquidity - postSwapTokenToReceiveLiquidity;
        return +amountToReceive; // TODO: check this decimal value
      } else {
        return undefined;
      }
    },
    [tokenToTrade.poolLiquidity, tokenToReceive.poolLiquidity]
  );

  /** Update token to receive amount any time the token symbols, token to trade amount, or spot price is updated. */
  useEffect(() => {
    if (spotPrice !== undefined) {
      // TODO: check on if we should keep getTokenExcchangeAmount
      // const tokenToReceiveAmount = getTokenExchangeAmount(tokenToTrade.amount, spotPrice);
      const tokenToReceiveAmount = getReceivedAmount(tokenToTrade.amount);
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount || 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, spotPrice, tokenToTrade.amount]);

  /** Update balances any time the token symbols or the cached paired account balances change. */
  useEffect(() => {
    if (tokenToTrade.symbol !== undefined) {
      const tokenToTradeBalance = getTokenBalance(tokenToTrade.symbol);
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));
      if (poolLiquidity !== undefined && poolLiquidity instanceof Map) {
        dispatch(setTokenToTradePoolLiquidity(poolLiquidity?.get(tokenToTrade.symbol)));
      }
    }
    if (tokenToReceive.symbol !== undefined) {
      const tokenToReceiveBalance = getTokenBalance(tokenToReceive.symbol);
      dispatch(setTokenToReceiveBalance(tokenToReceiveBalance));
      if (poolLiquidity !== undefined && poolLiquidity instanceof Map) {
        dispatch(setTokenToReceivePoolLiquidity(poolLiquidity?.get(tokenToReceive.symbol)));
      }
    }

    // get pool liquidity for selected symbols
    // TODO: revisit this approach
    if (tokenToTrade.symbol && tokenToReceive.symbol) {
      // TODO: should we use usePrevious here to only make this call when the selected token has changed?
      getPoolLiquidity(tokenToTrade.symbol, tokenToReceive.symbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, getTokenBalance, tokenToTrade.symbol, tokenToReceive.symbol, walletData?.pairedAccountBalance]);

  const handleTokenToTradeAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToTradeAmount = Number(inputElement.value);
      dispatch(setTokenToTradeAmount(tokenToTradeAmount));
    },
    [dispatch]
  );

  const handleTokenToTradeSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToTradeSymbol = inputElement.value;
      dispatch(setTokenToTradeSymbol(tokenToTradeSymbol));
      const tokenToTradeBalance = getTokenBalance(tokenToTradeSymbol);
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));
      updateExchangeRate({ tokenToTradeSymbol });
    },
    [dispatch, getTokenBalance, updateExchangeRate]
  );

  const handleTokenToReceiveAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToReceiveAmount = Number(inputElement.value);
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount));
    },
    [dispatch]
  );

  const handleTokenToReceiveSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToReceiveSymbol = inputElement.value;
      dispatch(setTokenToReceiveSymbol(tokenToReceiveSymbol));
      const tokenToReceiveBalance = getTokenBalance(tokenToReceiveSymbol);
      dispatch(setTokenToReceiveBalance(tokenToReceiveBalance));
      updateExchangeRate({ tokenToReceiveSymbol });
    },
    [dispatch, updateExchangeRate, getTokenBalance]
  );

  const swapTokens = useCallback(() => {
    dispatch(swapTokenToTradeAndReceive());
    updateExchangeRate({ tokenToTradeSymbol: tokenToReceive.symbol, tokenToReceiveSymbol: tokenToTrade.symbol });
  }, [dispatch, updateExchangeRate, tokenToReceive.symbol, tokenToTrade.symbol]);

  const setTokenToTradeAmountWithFormula = useCallback(
    (formula: formulaTypes = formulaTypes.MAX) => {
      if (tokenToTrade.balance === undefined) {
        console.warn("Token To Trade balance is null");
        return;
      }
      const amountToTrade = formula === formulaTypes.MAX ? tokenToTrade.balance : halfOf(tokenToTrade.balance);
      dispatch(setTokenToTradeAmount(amountToTrade));
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

  const getExchangeRateDisplay = useCallback(() => {
    if (spotPrice === undefined) {
      return <b>--</b>;
    }
    return (
      <>
        <b>1</b> {`${tokenToTrade.symbol} =`} <b>{`${spotPrice?.toFixed(5)} ${tokenToReceive.symbol}`}</b>
      </>
    );
  }, [spotPrice, tokenToTrade.symbol, tokenToReceive.symbol]);

  return (
    <ChakraProvider theme={HederaOpenDexTheme}>
      <Box data-testid="swap-component" bg="white" borderRadius="24px" width="100%" padding="1rem">
        <Flex alignItems={"center"} marginBottom={"8px"}>
          <Heading as="h4" size="lg">
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
            <Text color={"#4D4D4D"}>{(+localSwapState.slippage).toFixed(1)}%</Text>
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
            <SwapSettingsInput {...swapSettingsProps().slippage} />
            <SwapSettingsInput {...swapSettingsProps().transactionDeadline} />
          </Flex>
        </Collapse>
        <TokenInput
          data-testid="token-to-trade-component"
          title="Token To Trade"
          tokenAmount={tokenToTrade.amount}
          tokenSymbol={tokenToTrade.symbol}
          tokenBalance={tokenToTrade.balance}
          walletConnectionStatus={connectionStatus}
          onTokenAmountChange={handleTokenToTradeAmountChange}
          onTokenSymbolChange={handleTokenToTradeSymbolChange}
          isHalfAndMaxButtonsVisible={true}
          onMaxButtonClick={handleTokenToTradeMaxButtonClick}
          onHalfButtonClick={handleTokenToTradeHalfButtonClick}
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
          tokenAmount={tokenToReceive.amount}
          tokenSymbol={tokenToReceive.symbol}
          tokenBalance={tokenToReceive.balance}
          walletConnectionStatus={connectionStatus}
          onTokenAmountChange={handleTokenToReceiveAmountChange}
          onTokenSymbolChange={handleTokenToReceiveSymbolChange}
        />
        <Flex paddingTop="1rem">
          <Box flex="2" paddingRight="1rem">
            <Text fontSize="xs">Transaction Fee</Text>
            <Text fontSize="xs" fontWeight="bold">
              0.00%
            </Text>
          </Box>
          <Box flex="2">
            <Text fontSize="xs">Price Impact</Text>
            <Text fontSize="xs" fontWeight="bold">
              {priceImpact()}
            </Text>
          </Box>
          <Box flex="4">
            <Text fontSize="xs">Swap Exchange Rate</Text>
            <Text fontSize="xs">{getExchangeRateDisplay()}</Text>
          </Box>
        </Flex>
        <Flex direction="column" grow="1">
          {connectionStatus === WalletConnectionStatus.PAIRED ? (
            <SwapConfirmation sendSwapTransaction={sendSwapTransaction} swapState={swapState} />
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

export { Swap };
