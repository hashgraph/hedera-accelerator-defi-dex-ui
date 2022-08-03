import React, { useState } from "react";
import { Box, Center, HStack, VStack, Button, Text } from "@chakra-ui/react";
import { Swap } from "../../../components";
import { useHashConnectContext } from "../../../context";

const Trade = (): JSX.Element => {
  const { clearWalletPairings, walletData, network, connectionStatus, installedExtensions } = useHashConnectContext();
  return (
    <HStack>
      <Box margin="1rem">
        <Center>
          <Swap
            connectionStatus={connectionStatus}
            // connectToWallet={connectToWallet}
            clearWalletPairings={clearWalletPairings}
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
