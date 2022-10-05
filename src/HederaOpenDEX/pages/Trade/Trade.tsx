import { Box, Center, HStack } from "@chakra-ui/react";
import { Swap } from "../../../components";
import { useHashConnectContext } from "../../../context";

const Trade = () => {
  const {
    hashConnectState,
    mirrorNodeState,
    connectToWallet,
    sendSwapTransaction,
    fetchSpotPrices,
    getPoolLiquidity,
    removeWalletPairings: clearWalletPairings,
    network,
  } = useHashConnectContext();

  const {
    walletData,
    walletConnectionStatus: connectionStatus,
    installedExtensions,
    spotPrices,
    poolLiquidity,
  } = hashConnectState;

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Swap
            title="Swap"
            sendSwapTransaction={sendSwapTransaction}
            connectionStatus={connectionStatus}
            connectToWallet={connectToWallet}
            clearWalletPairings={clearWalletPairings}
            fetchSpotPrices={fetchSpotPrices}
            spotPrices={spotPrices}
            getPoolLiquidity={getPoolLiquidity}
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
