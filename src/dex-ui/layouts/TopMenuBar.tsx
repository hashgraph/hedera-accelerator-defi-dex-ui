import { NavLink } from "react-router-dom";
import { Menu, MenuItem, Box, Text, Center, Flex } from "@chakra-ui/react";
import { useDexContext } from "@hooks";
import { Color, HederaIcon, WalletConnection, Tag } from "@dex-ui-components";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

const TopMenuBar = (props: TopMenuBarProps): JSX.Element => {
  const { app, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));

  return (
    <Menu>
      <Flex
        padding="2rem 1rem"
        w="100%"
        height="4rem"
        alignItems="center"
        bg={Color.White}
        borderBottom={`1px solid ${Color.Neutral._200}`}
      >
        <Box flex="1.5">
          <Flex direction="row" gap="2" alignItems="center">
            <HederaIcon />
            <Text textStyle="h4 bold">Hedera Open DEX</Text>
            <Tag label="Pre-Alpha" />
          </Flex>
        </Box>
        <Box flex="1">
          <Center gap="12">
            {props.menuOptions.map((menuOption, index) => {
              return (
                <Box flex="1" key={index}>
                  <NavLink key={menuOption} to={`${menuOption.toLowerCase()}`}>
                    <MenuItem justifyContent="center" borderRadius="4px" _hover={{ bg: Color.Grey_01 }}>
                      <Text textStyle="p medium medium">{menuOption}</Text>
                    </MenuItem>
                  </NavLink>
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
