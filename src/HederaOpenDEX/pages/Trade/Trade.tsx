import React from "react";
import { Box, Center } from "@chakra-ui/react";
import { Swap } from "../../../components";
import { useHashConnectContext } from "../../../context";
const Trade = (): JSX.Element => {
  const { clearWalletPairings, walletData, network, connectionStatus, installedExtensions } = useHashConnectContext();
  return (
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
  );
};

export { Trade };
