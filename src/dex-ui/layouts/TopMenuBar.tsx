import { Link as RouterLink } from "react-router-dom";
import { Menu, MenuItem, HStack, Box, Text, Center, Flex, Tag } from "@chakra-ui/react";
import { useDexContext } from "../hooks";
import { WalletConnection } from "../../dex-ui-components";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

const TopMenuBar = (props: TopMenuBarProps): JSX.Element => {
  const { app, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));

  return (
    <Menu>
      <Flex padding="2rem 1rem" marginBottom="2rem" w="100%" height="84px" alignItems="center">
        <Box flex="1.5">
          <HStack spacing="0.5rem">
            <Text textStyle="h3">Hedera Open DEX</Text>
            <Tag textStyle="b3" size="sm">
              Pre-Alpha
            </Tag>
          </HStack>
        </Box>
        <Box flex="1">
          <Center>
            {props.menuOptions.map((menuOption, index) => {
              return (
                <Box flex="1" key={index}>
                  <RouterLink key={menuOption} to={`/${menuOption.toLowerCase()}`}>
                    <MenuItem justifyContent="center" _hover={{ bg: "gray.200" }}>
                      <Text textStyle="h3">{menuOption}</Text>
                    </MenuItem>
                  </RouterLink>
                </Box>
              );
            })}
          </Center>
        </Box>
        <Box flex="1.5">
          <Box textAlign="right" float="right" borderRadius="8px" width="fit-content">
            <WalletConnection
              accountId={wallet.savedPairingData?.accountIds[0] ?? ""}
              connectionState={wallet.hashConnectConnectionState}
              accountBalances={wallet.pairedAccountBalance}
              isLoading={app.isFeatureLoading("pairedAccountBalance")}
              connectToWallet={wallet.connectToWallet}
              disconnectFromWallet={wallet.disconnectWallet}
            />
          </Box>
        </Box>
      </Flex>
    </Menu>
  );
};

export { TopMenuBar };
