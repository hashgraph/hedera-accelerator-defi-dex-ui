import { ChangeEvent, MouseEvent, useCallback, useEffect, useReducer } from "react";
import { ChakraProvider, Box, Heading, Flex, Spacer, Text } from "@chakra-ui/react";
import { SettingsIcon, UpDownIcon } from "@chakra-ui/icons";
import { HashConnectTypes } from "hashconnect";
import { WalletConnectionStatus, Networks } from "../../hooks/useHashConnect";
import { HederaOpenDexTheme } from "../../HederaOpenDEX/styles";
import { swapReducer, initialSwapState, initSwapReducer } from "./reducers";
import { ActionType } from "./actions/actionTypes";
import {
  setTokenToTradeAmount,
  setTokenToTradeSymbol,
  setTokenToTradeBalance,
  setTokenToReceiveAmount,
  setTokenToReceiveSymbol,
  setTokenToReceiveBalance,
  setSpotPrice,
} from "./actions/swapActions";
import { Button, IconButton, SwapConfirmation } from "../base";
import { TokenInput } from "../TokenInput/TokenInput";
import { formulaTypes } from "./types";
import { halfOf } from "./utils";
import { TOKEN_SYMBOL_TO_ACCOUNT_ID } from "../../hooks/useHashConnect";
export interface SwapProps {
  title: string;
  sendSwapTransaction: (payload: any) => void;
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  fetchSpotPrices: () => void;
  connectionStatus: WalletConnectionStatus;
  spotPrices: Map<string, number | undefined> | undefined;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const Swap = (props: SwapProps) => {
  const { title, spotPrices, walletData, connectionStatus, connectToWallet, sendSwapTransaction } = props;
  const [swapState, dispatch] = useReducer(swapReducer, initialSwapState, initSwapReducer);
  const { tokenToTrade, tokenToReceive, spotPrice } = swapState;

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

  /** Update token to receive amount any time the token symbols, token to trade amount, or spot price is updated. */
  useEffect(() => {
    let tokenToTradeRecieveAmount;
    if (spotPrice !== undefined) {
      tokenToTradeRecieveAmount = Number((tokenToTrade.amount * spotPrice).toPrecision(8));
    } else {
      tokenToTradeRecieveAmount = 0;
      console.warn("[Swap - useEffect] Spot Price is undefined");
    }
    dispatch(setTokenToReceiveAmount(tokenToTradeRecieveAmount));
  }, [spotPrice, tokenToTrade.amount, tokenToTrade.symbol, tokenToReceive.symbol]);

  /** Update balances any time the token symbols or the cached paired account balances change. */
  useEffect(() => {
    if (tokenToTrade.symbol !== undefined) {
      const tokenToTradeBalance = getTokenBalance(tokenToTrade.symbol);
      dispatch(setTokenToTradeBalance(tokenToTradeBalance));
    }
    if (tokenToReceive.symbol !== undefined) {
      const tokenToReceiveBalance = getTokenBalance(tokenToReceive.symbol);
      dispatch(setTokenToReceiveBalance(tokenToReceiveBalance));
    }
  }, [getTokenBalance, tokenToTrade.symbol, tokenToReceive.symbol, walletData?.pairedAccountBalance]);

  const updateExchangeRate = useCallback(
    ({ tokenToTradeSymbol = tokenToTrade.symbol, tokenToReceiveSymbol = tokenToReceive.symbol }) => {
      const route = `${tokenToTradeSymbol}=>${tokenToReceiveSymbol}`;
      console.warn("route", route);
      console.warn("spotPrices", spotPrices);
      if (spotPrices !== undefined && spotPrices instanceof Map && spotPrices.has(route)) {
        const newSpotPrice = spotPrices.get(route) ?? 0.0;
        console.log("route", route);
        console.log("spotPrices", spotPrices);
        console.log("newSpotPrice, spotPrice", newSpotPrice, spotPrice);
        dispatch(setSpotPrice(newSpotPrice));
      } else {
        dispatch(setSpotPrice(undefined));
      }
    },
    [dispatch, spotPrices, spotPrice, tokenToTrade.symbol, tokenToReceive.symbol]
  );

  const handleTokenToTradeAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputElement = event?.target as HTMLInputElement;
      const tokenToTradeAmount = Number(inputElement.value);
      dispatch(setTokenToTradeAmount(tokenToTradeAmount));
      let tokenToTradeRecieveAmount;
      if (spotPrice !== undefined) {
        tokenToTradeRecieveAmount = Number((tokenToTradeAmount * spotPrice).toPrecision(8));
      } else {
        tokenToTradeRecieveAmount = 0;
        console.warn("[handleTokenToTradeAmountChange] Spot Price is undefined");
      }
      dispatch(setTokenToReceiveAmount(tokenToTradeRecieveAmount));
      updateExchangeRate({});
    },
    [dispatch, updateExchangeRate, spotPrice]
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
    dispatch({ type: ActionType.SWITCH_TOKEN_TO_TRADE_AND_RECIEVE });
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
    [tokenToTrade.balance]
  );

  const setTokenToReceiveAmountWithFormula = useCallback(
    (formula: formulaTypes = formulaTypes.MAX) => {
      if (tokenToReceive.balance === undefined) {
        console.warn("Token To Receive balance is null");
        return;
      }
      const amountToRecieve = formula === formulaTypes.MAX ? tokenToReceive.balance : halfOf(tokenToReceive.balance);
      dispatch(setTokenToReceiveAmount(amountToRecieve));
    },
    [tokenToReceive.balance]
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

  const handleTokenToReceiveMaxButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTokenToReceiveAmountWithFormula(formulaTypes.MAX);
    },
    [setTokenToReceiveAmountWithFormula]
  );

  const handleTokenToReceiveHalfButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTokenToReceiveAmountWithFormula(formulaTypes.HALF);
    },
    [setTokenToReceiveAmountWithFormula]
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
        <Flex>
          <Heading as="h4" size="lg">
            {title}
          </Heading>
          <Spacer />
          <IconButton
            data-testid="settings-button"
            aria-label="Open and close settings modal."
            icon={<SettingsIcon w={6} h={6} />}
            variant="settings"
          />
        </Flex>
        <TokenInput
          data-testid="token-to-trade-component"
          title="Token To Trade"
          tokenAmount={tokenToTrade.amount}
          tokenSymbol={tokenToTrade.symbol}
          tokenBalance={tokenToTrade.balance}
          walletConnectionStatus={connectionStatus}
          onTokenAmountChange={handleTokenToTradeAmountChange}
          onTokenSymbolChange={handleTokenToTradeSymbolChange}
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
          onMaxButtonClick={handleTokenToReceiveMaxButtonClick}
          onHalfButtonClick={handleTokenToReceiveHalfButtonClick}
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
              --
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
      {/* </VStack> */}
    </ChakraProvider>
  );
};

export { Swap };
