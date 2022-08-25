import { ChangeEvent, useCallback, useState, useReducer, Dispatch } from "react";
import { ChakraProvider, Box, Heading, Flex, Spacer, Text } from "@chakra-ui/react";
import { SettingsIcon, UpDownIcon } from "@chakra-ui/icons";
import { HashConnectTypes } from "hashconnect";
import { WalletConnectionStatus, Networks, HashConnectState } from "../../hooks/useHashConnect";
import { HederaOpenDexTheme } from "../../HederaOpenDEX/styles";
import { swapReducer, initialSwapState, initSwapReducer, ActionType, SwapState, SwapActions } from "./reducers";

import { Button, IconButton, TokenAmountInput, TokenSelector, SwapConfirmation } from "../base";
import { useHashConnectContext } from "../../context";

export const tokenSymbolToAccountID = new Map<string, string>([
  ["L49A", "0.0.47646195"],
  ["L49B", "0.0.47646196"],
]);
export interface SwapProps {
  sendSwapTransaction: (payload: any) => void;
  // connectToWallet: () => void;
  clearWalletPairings: () => void;
  connectionStatus: WalletConnectionStatus;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const Swap = (props: SwapProps) => {
  const { walletData, connectionStatus, sendSwapTransaction } = props;
  const [swapState, dispatch] = useReducer(swapReducer, initialSwapState, initSwapReducer);
  const { inputToken, outputToken } = swapState;
  const { connectToWallet } = useHashConnectContext();

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
      <Box data-testid="swap-component" bg="white" borderRadius="24px" width="100%" padding="1rem">
        <Flex>
          <Heading as="h4" size="lg">
            Swap
          </Heading>
          <Spacer />
          <IconButton
            data-testid="settings-button"
            aria-label="Open and close settings modal."
            icon={<SettingsIcon w={6} h={6} />}
            variant="settings"
          />
        </Flex>
        <Box border="1px solid black" borderRadius="5px" backgroundColor="#F2F2F2">
          <Flex>
            <Box flex="5">
              <TokenAmountInput
                data-testid="swap-input"
                value={swapState?.inputToken?.amount}
                onChangeHandler={handleInputAmountChange}
                variant="token-amount-input"
              />
            </Box>
            <Box flex="4">
              <TokenSelector value={inputToken?.symbol} onChangeHandler={handleInputSymbolChange} />
            </Box>
          </Flex>
          <Flex backgroundColor="#F2F2F2">
            <Text fontSize="xs" padding="0.25rem" fontWeight="bold">
              Balance: {getBalanceByTokenSymbol(inputToken?.symbol ?? "") || "Connect to View"}
            </Text>
            <Button variant="xs-text">Half</Button>
            <Button variant="xs-text">Max</Button>
          </Flex>
        </Box>
        <Flex>
          <IconButton
            data-testid="switch-token-inputs-button"
            aria-label="Switch the token amount and symbol input values."
            icon={<UpDownIcon w={6} h={6} />}
            onClick={swapTokens}
            isRound={true}
            variant="switch-token-inputs"
          />
        </Flex>
        <Flex>
          <Box flex="5">
            <TokenAmountInput
              data-testid="swap-output"
              value={outputToken?.amount}
              onChangeHandler={handleOutputAmountChange}
            />
            <Text fontSize="xs">Balance: {getBalanceByTokenSymbol(outputToken?.symbol ?? "") || "-"}</Text>
            <Button variant="xs-text">Half</Button>
            <Button variant="xs-text">Max</Button>
          </Box>
          <Box flex="4">
            <TokenSelector value={outputToken?.symbol} onChangeHandler={handleOutputSymbolChange} />
          </Box>
        </Flex>
        <Flex direction="column" grow="1">
          {connectionStatus === WalletConnectionStatus.PAIRED ? (
            <SwapConfirmation sendSwapTransaction={sendSwapTransaction} swapState={swapState} />
          ) : (
            <Button data-testid="connect-wallet-button" onClick={connectToWallet}>
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
