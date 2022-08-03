import { ChangeEvent, useCallback, useState } from "react";
import { ChakraProvider, Box, Heading, VStack, HStack, Flex, Spacer, Text } from "@chakra-ui/react";
import { HashConnectTypes } from "hashconnect";
import { WalletConnectionStatus, Networks, HashConnectState } from "../../hooks/useHashConnect";
import { HederaOpenDexTheme } from "../../HederaOpenDEX/styles";
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
  inputToken?: {
    symbol: string;
    amount: number;
  };
  outputToken?: {
    symbol: string;
    amount: number;
  };
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
  const [inputToken, setTokenInput] = useState({
    symbol: "",
    amount: 0.0,
  });
  const [outputToken, setTokenOutput] = useState({
    symbol: "",
    amount: 0.0,
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>, targetField: string, setStateValue: any) => {
    const v = event?.target as HTMLInputElement;
    setStateValue((prevState: any) => ({
      ...prevState,
      [targetField]: v.value,
    }));
  }, []);

  const handleInputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleChange(event, "amount", setTokenInput);
    },
    [setTokenInput, handleChange]
  );

  const handleInputTokenChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleChange(event, "symbol", setTokenInput);
    },
    [setTokenInput, handleChange]
  );

  const handleOutputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleChange(event, "amount", setTokenOutput);
    },
    [setTokenOutput, handleChange]
  );

  const handleOutputTokenChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.log(event);
      handleChange(event, "symbol", setTokenOutput);
    },
    [setTokenOutput, handleChange]
  );

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
        <Box data-testid="swap-component" bg="rgb(36, 38, 76)" borderRadius="24px" width="100%" padding="1rem">
          <Heading
            as="p"
            size="sm"
            color="white"
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
                value={inputToken?.amount}
                onChangeHandler={handleInputAmountChange}
              />
            </Box>
            <Box flex="4">
              <TokenSelector value={inputToken?.symbol} onChangeHandler={handleInputTokenChange} />
              <Text>Balance: {getBalanceByTokenSymbol(inputToken?.symbol ?? "") || "-"}</Text>
            </Box>
          </Flex>
          <Flex>
            <Spacer />
            <SwapTokenInputsButton data-testid="swap-component" variant="swap" />
            <Spacer />
          </Flex>
          <Flex>
            <Box flex="5">
              <TokenAmountInput
                data-testid="swap-output"
                value={outputToken?.amount}
                onChangeHandler={handleOutputAmountChange}
              />
            </Box>
            <Box flex="4">
              <TokenSelector value={outputToken?.symbol} onChangeHandler={handleOutputTokenChange} />
              <Text>Balance: {getBalanceByTokenSymbol(outputToken?.symbol ?? "") || "-"}</Text>
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
