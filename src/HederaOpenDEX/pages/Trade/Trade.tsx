import React from "react";
import { Box, Center, HStack, VStack, Button, Text } from "@chakra-ui/react";
import { Swap } from "../../../components";
import { useHashConnectContext } from "../../../context";
import { useHaderaService } from "../../../hooks/useHederaService/useHederaService";

const Trade = (): JSX.Element => {
  const { clearWalletPairings, walletData, network, connectionStatus, installedExtensions } = useHashConnectContext();
  const { balance, getBalance, swapTokenAWithB, swapTokenBWithA, addLiquidityToPool } = useHaderaService();

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Swap
            connectionStatus={connectionStatus}
            // connectToWallet={connectToWallet}
            clearWalletPairings={clearWalletPairings}
            walletData={walletData}
            network={network}
            installedExtensions={installedExtensions}
          />
        </Center>
      </Box>
      <Box
        data-testid="swap-component"
        bg="rgb(36, 38, 76)"
        borderRadius="24px"
        width="100%"
        padding="1rem">
        <Center>
          <VStack>
            <Button
              onClick={getBalance}
              data-testid="connect-wallet-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              Get Balance
            </Button>
            <Text
              width="400px"
              textAlign="center"
            >{`Contract Balance TokenA: ${balance.tokenA} TokenB: ${balance.tokenB}`}</Text>
            <Button
              onClick={swapTokenAWithB}
              data-testid="connect-wallet-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              Swap Token A
            </Button>
            <Button
              onClick={swapTokenBWithA}
              data-testid="connect-wallet-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              Swap Token B
            </Button>
            <Button
              onClick={addLiquidityToPool}
              data-testid="connect-wallet-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              Add Liquidity
            </Button>
            <Text>
            </Text>
          </VStack>
        </Center>
      </Box>
    </HStack>
  );
};

export { Trade };
