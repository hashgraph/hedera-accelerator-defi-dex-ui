import { ChangeEvent, useCallback, useState, useReducer, Dispatch } from "react";
import { ChakraProvider, Box, Heading, VStack, HStack, Flex, Spacer, Text } from "@chakra-ui/react";
import { HashConnectTypes } from "hashconnect";
import { WalletConnectionStatus, Networks, HashConnectState } from "../../hooks/useHashConnect";
import { HederaOpenDexTheme } from "../../HederaOpenDEX/styles";
import { swapReducer, initialSwapState, initSwapReducer, ActionType, SwapState, SwapActions } from "./reducers";

import {
  TokenAmountInput,
  TokenSelector,
  SwapTokenInputsButton,
  ConnectToWalletButton,
  CallSwapContractButton,
} from "../base";

const tokenSymbolToAccountID = new Map<string, string>([
  ["L49A", "0.0.47646196"],
  ["L49B", "0.0.47646195"],
]);
export interface SwapProps {
  // connectToWallet: () => void;
  clearWalletPairings: () => void;
  connectionStatus: WalletConnectionStatus;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const Swap = (props: SwapProps) => {
  const { walletData, connectionStatus } = props;
  const [swapState, dispatch] = useReducer(swapReducer, initialSwapState, initSwapReducer);
  const { inputToken, outputToken } = swapState;

  const handleSwapInputsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, actionType: ActionType, field: string) => {
      const inputElement = event?.target as HTMLInputElement;
      dispatch({ type: actionType, field, payload: inputElement.value });
    },
    []
  );

  const handleInputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleSwapInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "amount");
    },
    [handleSwapInputsChange]
  );

  const handleInputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleSwapInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "symbol");
    },
    [handleSwapInputsChange]
  );

  const handleOutputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleSwapInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "amount");
    },
    [handleSwapInputsChange]
  );

  const handleOutputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleSwapInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "symbol");
    },
    [handleSwapInputsChange]
  );

  const swapTokens = useCallback(() => dispatch({ type: ActionType.SWITCH_INPUT_AND_OUTPUT_TOKEN }), [dispatch]);
  const getBalanceByTokenSymbol = useCallback(
    (tokenSymbol: string): number => {
      if (tokenSymbol === "HBAR") {
        return walletData?.pairedAccountBalance?.hbars;
      }
      const tokenBalances = walletData?.pairedAccountBalance?.tokens;
      const tokenId = tokenSymbolToAccountID.get(tokenSymbol);
      return tokenBalances?.find((tokenData: any) => tokenData.tokenId === tokenId)?.balance;
    },
    [walletData]
  );

  return (
    <ChakraProvider theme={HederaOpenDexTheme}>
      <VStack align="stretch" minWidth="sm">
        <Box data-testid="swap-component" bg="white" borderRadius="24px" width="100%" padding="1rem">
          <Heading
            as="p"
            size="sm"
            color="black"
            paddingLeft="5px"
            paddingTop="0.5rem"
            paddingBottom="0.5rem"
            marginBottom="1rem"
          >
            Swap
          </Heading>
          <Flex>
            <Box flex="5">
              <TokenAmountInput
                data-testid="swap-input"
                value={swapState?.inputToken?.amount}
                onChangeHandler={handleInputAmountChange}
              />
              <Text>Balance: {getBalanceByTokenSymbol(inputToken?.symbol ?? "") || "-"}</Text>
            </Box>
            <Box flex="4">
              <TokenSelector value={inputToken?.symbol} onChangeHandler={handleInputSymbolChange} />
            </Box>
          </Flex>
          <Flex>
            <Spacer />
            <SwapTokenInputsButton onClick={swapTokens} data-testid="swap-component" variant="swap" />
            <Spacer />
          </Flex>
          <Flex>
            <Box flex="5">
              <TokenAmountInput
                data-testid="swap-output"
                value={outputToken?.amount}
                onChangeHandler={handleOutputAmountChange}
              />
              <Text>Balance: {getBalanceByTokenSymbol(outputToken?.symbol ?? "") || "-"}</Text>
            </Box>
            <Box flex="4">
              <TokenSelector value={outputToken?.symbol} onChangeHandler={handleOutputSymbolChange} />
            </Box>
          </Flex>
          {connectionStatus === WalletConnectionStatus.PAIRED ? (
            <CallSwapContractButton data-testid="swap-tokens-button" variant="secondary" />
          ) : (
            <ConnectToWalletButton data-testid="connect-wallet-button" variant="primary" />
          )}
        </Box>
      </VStack>
    </ChakraProvider>
  );
};

export { Swap };
