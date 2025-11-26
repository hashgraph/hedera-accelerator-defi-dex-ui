import { NavLink } from "react-router-dom";
import {
  Box,
  Flex,
  Menu,
  MenuItem,
  Alert,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useDexContext } from "@dex/hooks";
import { Color, HashDaoLogo, WalletConnection, Text } from "@shared/ui-kit";
import { useEffect, useState } from "react";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

export function TopMenuBar(props: TopMenuBarProps): JSX.Element {
  const { app, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));
  const [reconnectionInProgress, setReconnectionInProgress] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobileNav = useBreakpointValue({ base: true, md: false });
  const logoWidth = useBreakpointValue({ base: "50%", sm: "60%" });

  useEffect(() => {
    if (localStorage.getItem("reconnectionInProgress")) {
      setReconnectionInProgress(true);

      setTimeout(() => {
        localStorage.removeItem("reconnectionInProgress");
        setReconnectionInProgress(false);
      }, 10000);
    }
  }, []);

  return (
    <Flex as="header" layerStyle="navbar">
      <Menu>
        <Flex direction="row" gap={{ base: "2", md: "4" }} alignItems="center" flex="1">
          <Flex direction="row" gap="2" alignItems="center" flexShrink={0}>
            <NavLink to="/">
              <HashDaoLogo width={logoWidth} height="100%" cursor="pointer" />
            </NavLink>
          </Flex>

          {/* Alert for network switching - hide on very small screens */}
          <Alert variant="" display={{ base: "none", lg: "flex" }} flex="1">
            {reconnectionInProgress && (
              <Text.P_Small_Regular fontStyle="italic">
                Network switching detected. If you {"don't"} have any accounts on the selected network since we are
                unable to check it, you can switch back to the previous one.
              </Text.P_Small_Regular>
            )}
          </Alert>

          {/* Desktop Navigation */}
          <Flex direction="row" gap="1" display={{ base: "none", md: "flex" }}>
            {props.menuOptions.map((menuOption, index) => {
              return (
                <Box width="fit-content" key={index}>
                  <NavLink key={menuOption} to={`${menuOption.toLowerCase()}`}>
                    <MenuItem
                      justifyContent="center"
                      borderRadius="8px"
                      _hover={{ bg: Color.Neutral._100 }}
                      px={{ base: "2", lg: "4" }}
                    >
                      <Text.P_Medium_Medium>{menuOption}</Text.P_Medium_Medium>
                    </MenuItem>
                  </NavLink>
                </Box>
              );
            })}
          </Flex>
        </Flex>

        {/* Mobile hamburger menu */}
        {isMobileNav && (
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={onOpen}
            display={{ base: "flex", md: "none" }}
          />
        )}

        {/* Desktop wallet connection */}
        <Box
          textAlign="right"
          borderRadius="8px"
          width="fit-content"
          display={{ base: "none", md: "block" }}
          flexShrink={0}
        >
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

      {/* Mobile Drawer Menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {props.menuOptions.map((menuOption, index) => (
                <NavLink key={index} to={`${menuOption.toLowerCase()}`} onClick={onClose}>
                  <Box py={3} px={4} borderRadius="8px" _hover={{ bg: Color.Neutral._100 }} transition="all 0.2s">
                    <Text.P_Medium_Medium>{menuOption}</Text.P_Medium_Medium>
                  </Box>
                </NavLink>
              ))}
              <Box pt={4} borderTopWidth="1px">
                <WalletConnection
                  accountId={wallet.savedPairingData?.accountIds[0] ?? ""}
                  connectionState={wallet.hashConnectConnectionState}
                  accountBalances={wallet.pairedAccountBalance}
                  isLoading={app.isFeatureLoading("pairedAccountBalance")}
                  connectToWallet={wallet.connectToWallet}
                  disconnectFromWallet={wallet.disconnectWallet}
                />
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
