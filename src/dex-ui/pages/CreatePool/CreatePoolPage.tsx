import { Box, HStack, Flex, Center } from "@chakra-ui/react";
import { useDexContext } from "../../hooks";
import { CreatePoolForm } from "../../../dex-ui-components/presets";

export function CreatePoolPage() {
  const { app, wallet, swap, pools } = useDexContext(({ app, wallet, swap, pools }) => ({ app, wallet, swap, pools }));

  const isFormLoading =
    app.isFeatureLoading("tokenPairs") ||
    app.isFeatureLoading("pairedAccountBalance") ||
    app.isFeatureLoading("allPoolsMetrics");

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="410px">
            <CreatePoolForm
              isLoading={isFormLoading}
              pairedAccountBalance={wallet.pairedAccountBalance}
              tokenPairs={swap.tokenPairs}
              transactionState={pools.createPoolTransactionState}
              connectionStatus={wallet.hashConnectConnectionState}
              connectToWallet={wallet.connectToWallet}
              sendCreatePoolTransaction={pools.sendCreatePoolTransaction}
              resetCreatePoolState={pools.resetCreatePoolState}
            />
          </Flex>
        </Center>
      </Box>
    </HStack>
  );
}
