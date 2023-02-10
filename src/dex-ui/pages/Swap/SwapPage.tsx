import { Box, Center, Flex, HStack } from "@chakra-ui/react";
import { SwapTokensForm } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { formatSwapPageData } from "./formatters";
import { GetTokensButton } from "../../components";

export function SwapPage() {
  const [app, wallet, swap] = useDexContext(({ app, wallet, swap }) => [app, wallet, swap]);
  const { fee, spotPrices, poolLiquidity } = swap;
  const { formattedSpotPrices, formattedPoolLiquidity, formattedFee } = formatSwapPageData({
    spotPrices,
    poolLiquidity,
    fee,
  });

  const isFormLoading =
    app.isFeatureLoading("fee") ||
    app.isFeatureLoading("spotPrices") ||
    app.isFeatureLoading("tokenPairs") ||
    app.isFeatureLoading("pairedAccountBalance");

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="410px">
            <SwapTokensForm
              pairedAccountBalance={wallet.pairedAccountBalance}
              tokenPairs={swap.tokenPairs}
              spotPrices={formattedSpotPrices}
              poolLiquidity={formattedPoolLiquidity}
              fee={formattedFee}
              isLoading={isFormLoading}
              transactionState={swap.transactionState}
              connectionStatus={wallet.hashConnectConnectionState}
              sendSwapTransaction={swap.sendSwapTransaction}
              getPoolLiquidity={swap.getPoolLiquidity}
              fetchSpotPrices={swap.fetchSpotPrices}
              connectToWallet={wallet.connectToWallet}
            />
            <GetTokensButton />
          </Flex>
        </Center>
      </Box>
    </HStack>
  );
}
