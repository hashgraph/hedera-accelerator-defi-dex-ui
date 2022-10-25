import { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";
import {
  ChakraProvider,
  Box,
  Heading,
  Flex,
  Spacer,
  Text,
  Collapse,
  TagCloseButton,
  Link,
  Tag,
  Skeleton,
} from "@chakra-ui/react";
import { SettingsIcon, UpDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { HashConnectTypes } from "hashconnect";
import { DEXTheme } from "../../dex-ui/styles";
import { swapReducer, initialSwapState, initSwapReducer } from "./reducers";
import {
  setTokenToTradeAmount,
  setTokenToTradeDisplayAmount,
  setTokenToTradeSymbol,
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
import { Button, IconButton, SwapSettingsInput, SwapSettingsInputProps } from "../base";
import { TokenInput } from "../TokenInput/TokenInput";
import { formulaTypes } from "./types";
import { halfOf } from "./utils";
import { TOKEN_SYMBOL_TO_ACCOUNT_ID } from "../TokenInput/constants";
import { SwapConfirmation, SwapConfirmationStep } from "./SwapConfirmation";
import { Networks, WalletConnectionStatus } from "../../dex-ui/store/walletSlice";
import { TransactionState } from "../../dex-ui/store/swapSlice";

export interface SwapProps {
  title: string;
  sendSwapTransaction: (payload: any) => void;
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) => void;
  connectionStatus: WalletConnectionStatus;
  spotPrices: Record<string, number | undefined>;
  fee: string;
  poolLiquidity: Record<string, number | undefined>;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
  transactionState: TransactionState;
  isLoaded: boolean;
}

const Swap = (props: SwapProps) => {
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
    transactionState,
    isLoaded,
  } = props;
  const [swapState, dispatch] = useImmerReducer(swapReducer, initialSwapState, initSwapReducer);
  const { tokenToTrade, tokenToReceive, spotPrice, swapSettings } = swapState;

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

  const swapSettingsProps = useCallback((): { [key: string]: SwapSettingsInputProps } => {
    return {
      slippage: {
        label: "Slippage",
        popoverText: `Slippage refers to the difference between the expected 
    price of a trade and the price at which the trade is executed.`,
        inputUnit: "%",
        onInputChange: onSlippageInputChange,
        value: swapSettings.slippage,
      },
      transactionDeadline: {
        label: "Transaction Deadline",
        popoverText: `If your transaction is not completed within the deadline, it will revert and your coins
    (less the fee) will be returned to you.`,
        inputUnit: "min",
        onInputChange: onTransactionDeadlineInputChange,
        value: swapSettings.transactionDeadline,
      },
    };
  }, [swapSettings, onSlippageInputChange, onTransactionDeadlineInputChange]);

  // TODO: probably want to use usePrevious instead so we dont need this. right now, without this on symbol change it
  //         updates spot price which then causes logic to run to calculate tokenToReceive amount but it uses the old
  //        liquidity value of whichever token was just selected previously
  useEffect(() => {
    if (swapState.tokenToTrade.amount && swapState.tokenToTrade.symbol !== swapState.tokenToReceive.symbol) {
      const tokenToReceiveAmount = getReceivedAmount(tokenToTrade.amount);
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount || 0.0));
      dispatch(setTokenToReceiveDisplayAmount(tokenToReceiveAmount ? String(tokenToReceiveAmount) : "0.0"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapState.tokenToTrade.poolLiquidity, swapState.tokenToReceive.poolLiquidity]);

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
      if (spotPrices?.[route] !== undefined) {
        const newSpotPrice = spotPrices[route] ?? 0.0;
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
      dispatch(setTokenToReceiveAmount(tokenToReceiveAmount || 0.0));
      dispatch(setTokenToReceiveDisplayAmount(tokenToReceiveAmount ? String(tokenToReceiveAmount) : "0.0"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, spotPrice, tokenToTrade.amount]);

  /** Update balances any time the token symbols or the cached paired account balances change. */
  useEffect(() => {
    if (tokenToTrade.symbol !== undefined) {
      const tokenToTradeBalance = getTokenBalance(tokenToTrade.symbol);
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));
      if (poolLiquidity !== undefined) {
        dispatch(setTokenToTradePoolLiquidity(poolLiquidity?.[tokenToTrade.symbol]));
      }
    }
    if (tokenToReceive.symbol !== undefined) {
      const tokenToReceiveBalance = getTokenBalance(tokenToReceive.symbol);
      dispatch(setTokenToReceiveBalance(tokenToReceiveBalance));
      if (poolLiquidity !== undefined) {
        dispatch(setTokenToReceivePoolLiquidity(poolLiquidity?.[tokenToReceive.symbol]));
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
      dispatch(setTokenToTradeDisplayAmount(inputElement.value ?? "0.0"));
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
      dispatch(setTokenToReceiveDisplayAmount(inputElement.value ?? "0.0"));
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

  const getHashScanLink = useCallback(() => {
    const transactionId = transactionState.successPayload?.transactionId.toString();
    const urlFormattedTimestamp = transactionId?.split("@")[1].replace(".", "-");
    const formattedTransactionId = `${transactionId?.split("@")[0]}-${urlFormattedTimestamp}`;
    // format: https://hashscan.io/#/testnet/transaction/0.0.34744739-1665448985-817445871
    // TODO: set testnet/mainnet based on network
    return `https://hashscan.io/#/testnet/transaction/${formattedTransactionId}`;
  }, [transactionState]);

  return (
    <ChakraProvider theme={DEXTheme}>
      <Box data-testid="swap-component" bg="white" borderRadius="24px" width="100%" padding="1rem">
        {transactionState.successPayload &&
        !transactionState.errorMessage &&
        !transactionState.transactionWaitingToBeSigned &&
        localSwapState.showSuccessMessage ? (
          <Tag width={"100%"} padding={"8px"} marginBottom={"8px"} backgroundColor={"#00e64d33"}>
            <Flex width={"100%"} flexDirection={"column"}>
              <Text color={"#000000"}>
                {`Swapped ${localSwapState.tokenToTradeAmount} ${localSwapState.tokenToTradeSymbol}
                 for ${localSwapState.tokenToReceiveAmount} ${localSwapState.tokenToReceiveSymbol}`}
              </Text>
              <Link
                width={"fit-content"}
                display={"flex"}
                alignItems={"center"}
                color={"#0180FF"}
                href={getHashScanLink()}
                isExternal
              >
                <Text textDecoration={"underline"}>View in HashScan</Text> <ExternalLinkIcon />
              </Link>
            </Flex>
            <TagCloseButton
              color={"#000000"}
              onClick={() => setLocalSwapState({ ...localSwapState, showSuccessMessage: false })}
            />
          </Tag>
        ) : (
          ""
        )}
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
            <SwapSettingsInput {...swapSettingsProps().slippage} />
            <SwapSettingsInput {...swapSettingsProps().transactionDeadline} />
          </Flex>
        </Collapse>
        <TokenInput
          data-testid="token-to-trade-component"
          title="Token To Trade"
          tokenAmount={tokenToTrade.displayAmount}
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
          tokenAmount={tokenToReceive.displayAmount}
          tokenSymbol={tokenToReceive.symbol}
          tokenBalance={tokenToReceive.balance}
          walletConnectionStatus={connectionStatus}
          onTokenAmountChange={handleTokenToReceiveAmountChange}
          onTokenSymbolChange={handleTokenToReceiveSymbolChange}
        />
        <Flex paddingTop="1rem">
          <Box flex="2" paddingRight="1rem">
            <Text fontSize="xs">Transaction Fee</Text>
            <Skeleton speed={0.4} isLoaded={isLoaded}>
              <Text fontSize="xs" fontWeight="bold">
                {fee}
              </Text>
            </Skeleton>
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

export { Swap };
