import { Box, Center, Flex, HStack } from "@chakra-ui/react";
import { SwapTokens } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { formatSwapPageData } from "./formatters";
import { useSwapData } from "../../hooks/useSwapData";
import { REFRESH_INTERVAL } from "../../hooks/constants";
import { GetTokensButton } from "../../components";

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
          <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="400px">
            <SwapTokens
              title="Swap"
              sendSwapTransaction={swap.sendSwapTransaction}
              connectionStatus={wallet.hashConnectConnectionState}
              tokenPairs={swap.tokenPairs}
              connectToWallet={wallet.connectToWallet}
              spotPrices={formattedSpotPrices}
              fee={formattedFee}
              getPoolLiquidity={swap.getPoolLiquidity}
              setSelectedAccount={swap.setSelectedAccount}
              poolLiquidity={formattedPoolLiquidity}
              walletData={wallet}
              network={context.network}
              installedExtensions={wallet.availableExtension}
              transactionState={swap.transactionState}
              isFeatureLoading={app.isFeatureLoading}
            />
            <GetTokensButton />
          </Flex>
        </Center>
      </Box>
    </HStack>
  );
};

export { Swap };
