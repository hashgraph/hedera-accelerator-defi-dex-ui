import { Box, Center, HStack } from "@chakra-ui/react";
import { Swap } from "../../../components";
import { useHashConnectContext } from "../../../context";

const Trade = () => {
  const {
    clearWalletPairings,
    walletData,
    network,
    connectionStatus,
    installedExtensions,
    spotPrices,
    sendSwapTransaction,
    fetchSpotPrices,
  } = useHashConnectContext();
  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Swap
            title="Swap"
            sendSwapTransaction={sendSwapTransaction}
            connectionStatus={connectionStatus}
            clearWalletPairings={clearWalletPairings}
            fetchSpotPrices={fetchSpotPrices}
            spotPrices={spotPrices}
            walletData={walletData}
            network={network}
            installedExtensions={installedExtensions}
          />
        </Center>
      </Box>
    </HStack>
  );
};

export { Trade };
