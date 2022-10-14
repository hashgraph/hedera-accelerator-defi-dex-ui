import { Box, Center, HStack } from "@chakra-ui/react";
import { useEffect, useCallback } from "react";
import { Swap } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { mapBigNumberValuesToNumber } from "./formatters";
import { formatBigNumberToPercent } from "../../utils";

const Trade = () => {
  const [context, wallet, swap] = useDexContext(({ context, wallet, swap }) => [context, wallet, swap]);
  const { network } = context;
  const { walletData, walletConnectionStatus: connectionStatus, installedExtensions } = wallet;
  const { spotPrices, poolLiquidity, transactionState, setAsLoading, setAsLoaded, fetchFee, fetchSpotPrices } = swap;

  const formattedSpotPrices = mapBigNumberValuesToNumber(spotPrices);
  const formattedPoolLiquidity = mapBigNumberValuesToNumber(poolLiquidity);
  const formattedFee = formatBigNumberToPercent(swap.fee);

  const fetchSwapData = useCallback(async () => {
    setAsLoading();
    await fetchFee();
    await fetchSpotPrices();
    setAsLoaded();
  }, [setAsLoading, fetchFee, fetchSpotPrices, setAsLoaded]);

  useEffect(() => {
    fetchSwapData();
  }, [fetchSwapData]);

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
            spotPrices={formattedSpotPrices}
            fee={formattedFee}
            getPoolLiquidity={swap.getPoolLiquidity}
            poolLiquidity={formattedPoolLiquidity}
            walletData={walletData}
            network={network}
            installedExtensions={installedExtensions}
            transactionState={transactionState}
            isLoaded={swap.isLoaded}
          />
        </Center>
      </Box>
    </HStack>
  );
};

export { Trade };
