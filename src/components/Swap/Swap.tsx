import { ChakraProvider, Box, Heading, VStack, HStack, Flex, Spacer } from "@chakra-ui/react";
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
  walletData: Partial<HashConnectState> | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const Swap = (props: SwapProps) => {
  const { inputToken, outputToken, connectionStatus } = props;
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
              <TokenAmountInput data-testid="swap-input" value={inputToken?.amount} />
            </Box>
            <Box flex="4">
              <TokenSelector />
            </Box>
          </Flex>
          <Flex>
            <Spacer />
            <SwapTokenInputsButton data-testid="swap-component" variant="swap" />
            <Spacer />
          </Flex>
          <Flex>
            <Box flex="5">
              <TokenAmountInput data-testid="swap-output" value={outputToken?.amount} />
            </Box>
            <Box flex="4">
              <TokenSelector />
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
