import { Box, HStack, Flex, Center } from "@chakra-ui/react";
import { useDexContext } from "../../hooks";
import { formatSwapPageData } from "../Swap/formatters";
import { AddLiquidityForm } from "../../../dex-ui-components/presets/AddLiquidityForm/AddLiquidityForm";

export function AddLiquidityPage() {
  const { app, wallet, swap, pools } = useDexContext(({ app, wallet, swap, pools }) => ({ app, wallet, swap, pools }));
  const { spotPrices, poolLiquidity } = swap;
  const { formattedSpotPrices } = formatSwapPageData({
    spotPrices,
    poolLiquidity,
  });

  const isFormLoading =
    app.isFeatureLoading("spotPrices") ||
    app.isFeatureLoading("pairedAccountBalance") ||
    app.isFeatureLoading("tokenPairs");

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="410px">
            <AddLiquidityForm
              isLoading={isFormLoading}
              pairedAccountBalance={wallet.pairedAccountBalance}
              tokenPairs={swap.tokenPairs}
              spotPrices={formattedSpotPrices}
              userPoolsMetrics={pools.userPoolsMetrics}
              transactionState={pools.addLiquidityTransactionState}
              connectionStatus={wallet.hashConnectConnectionState}
              connectToWallet={wallet.connectToWallet}
              fetchSpotPrices={swap.fetchSpotPrices}
              sendAddLiquidityTransaction={pools.sendAddLiquidityTransaction}
              resetAddLiquidityState={pools.resetAddLiquidityState}
            />
          </Flex>
        </Center>
      </Box>
    </HStack>
  );
}
