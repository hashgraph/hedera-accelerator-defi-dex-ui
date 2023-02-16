import { Box, HStack, Flex, Center } from "@chakra-ui/react";
import { useDexContext } from "../../hooks";
import { CreatePoolForm } from "../../../dex-ui-components/presets/CreatePoolForm/CreatePoolForm";

export function CreatePoolPage() {
  const { app, wallet, pools } = useDexContext(({ app, wallet, pools }) => ({ app, wallet, pools }));

  const isFormLoading = app.isFeatureLoading("pairedAccountBalance") || app.isFeatureLoading("allPoolsMetrics");

  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="410px">
            <CreatePoolForm
              isLoading={isFormLoading}
              pairedAccountBalance={wallet.pairedAccountBalance}
              tokenPairs={pools.tokenPairs}
              allPoolsMetrics={pools.allPoolsMetrics}
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
