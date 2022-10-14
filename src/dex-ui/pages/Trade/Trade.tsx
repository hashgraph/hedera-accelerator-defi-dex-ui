import { Box, Center, HStack } from "@chakra-ui/react";
import { Swap } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";

const Trade = () => {
  const [context, wallet, swap] = useDexContext(({ context, wallet, swap }) => [context, wallet, swap]);
  const { network } = context;
  const { walletData, walletConnectionStatus: connectionStatus, installedExtensions } = wallet;
  const { spotPrices, poolLiquidity, transactionState } = swap;

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Swap
            title="Swap"
            sendSwapTransaction={swap.sendSwapTransaction}
            connectionStatus={connectionStatus}
            connectToWallet={wallet.connectToWallet}
            clearWalletPairings={wallet.clearWalletPairings}
            fetchSpotPrices={swap.fetchSpotPrices}
            spotPrices={spotPrices}
            getPoolLiquidity={swap.getPoolLiquidity}
            poolLiquidity={poolLiquidity}
            walletData={walletData}
            network={network}
            installedExtensions={installedExtensions}
            transactionState={transactionState}
          />
        </Center>
      </Box>
    </HStack>
  );
};

export { Trade };
