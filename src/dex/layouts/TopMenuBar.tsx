import { NavLink } from "react-router-dom";
import { Menu, MenuItem, Box, Text, Flex } from "@chakra-ui/react";
import { useDexContext } from "@dex/hooks";
import { Color, HederaIcon, WalletConnection, Tag } from "@shared/ui-kit";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

export function TopMenuBar(props: TopMenuBarProps): JSX.Element {
  const { app, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));

  return (
    <Flex as="header" layerStyle="navbar">
      <Menu>
        <Flex direction="row" gap="4">
          <Flex direction="row" gap="2" alignItems="center">
            <HederaIcon boxSize="8" />
            <Tag label="Pre-Alpha" />
          </Flex>
          <Flex direction="row" gap="1">
            {props.menuOptions.map((menuOption, index) => {
              return (
                <Box width="fit-content" key={index}>
                  <NavLink key={menuOption} to={`${menuOption.toLowerCase()}`}>
                    <MenuItem justifyContent="center" borderRadius="4px" _hover={{ bg: Color.Neutral._100 }}>
                      <Text textStyle="p medium medium">{menuOption}</Text>
                    </MenuItem>
                  </NavLink>
                </Box>
              );
            })}
          </Flex>
        </Flex>
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
      </Menu>
    </Flex>
  );
}
