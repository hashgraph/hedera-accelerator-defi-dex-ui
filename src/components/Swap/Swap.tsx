import { ChakraProvider, Box, Heading, VStack } from "@chakra-ui/react";
import { HashConnectTypes } from "hashconnect";
import { WalletConnectionStatus, Networks, HashConnectState } from "../../hooks/useHashConnect";
import { HederaOpenDexTheme } from "../../HederaOpenDEX/styles";
import { TokenAmountInput, SwapTokenInputsButton, ConnectToWalletButton, CallSwapContractButton } from "../base";
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
          <TokenAmountInput data-testid="swap-input" value={inputToken?.amount} />
          <SwapTokenInputsButton data-testid="swap-component" variant="swap" />
          <TokenAmountInput data-testid="swap-output" value={outputToken?.amount} />
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
