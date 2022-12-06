import { Box, Center, HStack } from "@chakra-ui/react";
import { SwapTokens } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { formatSwapPageData } from "./formatters";
import { useSwapData } from "../../hooks/useSwapData";
import { REFRESH_INTERVAL } from "../../hooks/constants";

const Swap = () => {
  const [context, app, wallet, swap] = useDexContext(({ context, wallet, app, swap }) => [context, app, wallet, swap]);
  const { fee, spotPrices, poolLiquidity } = swap;
  const { formattedSpotPrices, formattedPoolLiquidity, formattedFee } = formatSwapPageData({
    spotPrices,
    poolLiquidity,
    fee,
  });

  useSwapData(REFRESH_INTERVAL);

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <SwapTokens
            title="Swap"
            sendSwapTransaction={swap.sendSwapTransaction}
            connectionStatus={wallet.hashConnectConnectionState}
            connectToWallet={wallet.connectToWallet}
            spotPrices={formattedSpotPrices}
            fee={formattedFee}
            getPoolLiquidity={swap.getPoolLiquidity}
            poolLiquidity={formattedPoolLiquidity}
            walletData={wallet}
            network={context.network}
            installedExtensions={wallet.availableExtension}
            transactionState={swap.transactionState}
            isFeatureLoading={app.isFeatureLoading}
          />
        </Center>
      </Box>
    </HStack>
  );
};

export { Swap };
