import { Box, Center, HStack } from "@chakra-ui/react";
import { Swap } from "../../../components";
import { useHashConnectContext } from "../../../context";

const Trade = () => {
  const {
    connectToWallet,
    clearWalletPairings,
    walletData,
    network,
    connectionStatus,
    installedExtensions,
    spotPrices,
    sendSwapTransaction,
    fetchSpotPrices,
    getPoolLiquidity,
    poolLiquidity,
    transactionWaitingToBeSigned,
  } = useHashConnectContext();
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
            transactionWaitingToBeSigned={transactionWaitingToBeSigned}
          />
        </Center>
      </Box>
    </HStack>
  );
};

export { Trade };
