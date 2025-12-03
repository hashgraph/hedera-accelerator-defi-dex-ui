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
  HStack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useDexContext } from "@dex/hooks";
import { NetworkSwitcher } from "@dex/components";
import { useTheme, useThemeMode, WalletConnection, Text, ThemeToggle } from "@shared/ui-kit";
import { useEffect, useState } from "react";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

export function TopMenuBar(props: TopMenuBarProps): JSX.Element {
  const { app, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));
  const [reconnectionInProgress, setReconnectionInProgress] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobileNav = useBreakpointValue({ base: true, md: false });
  const theme = useTheme();
  const { isDark } = useThemeMode();

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
    <Flex as="header" layerStyle="navbar" bg={theme.navbarBg} borderBottom={`1px solid ${theme.border}`}>
      <Menu>
        <Flex direction="row" gap={{ base: "2", md: "4" }} alignItems="center" flex="1">
          <Flex direction="row" gap="2" alignItems="center" flexShrink={0}>
            <NavLink to="/">
              <HStack spacing={2}>
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="10px"
                  bg="linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text.P_Medium_Semibold color="white" fontSize="lg" fontWeight="900">
                    H
                  </Text.P_Medium_Semibold>
                </Box>
                <Text.P_Medium_Semibold color={theme.text} display={{ base: "none", sm: "block" }}>
                  HashioDAO
                </Text.P_Medium_Semibold>
              </HStack>
            </NavLink>
          </Flex>

          {/* Alert for network switching - hide on very small screens */}
          <Alert variant="" display={{ base: "none", lg: "flex" }} flex="1" bg="transparent">
            {reconnectionInProgress && (
              <Text.P_Small_Regular fontStyle="italic" color={theme.textSecondary}>
                Network switching detected. If you {"don't"} have any accounts on the selected network since we are
                unable to check it, you can switch back to the previous one.
              </Text.P_Small_Regular>
            )}
          </Alert>

          {/* Desktop Navigation */}
          <Flex direction="row" gap="2" display={{ base: "none", md: "flex" }} alignItems="center">
            {props.menuOptions.map((menuOption, index) => {
              return (
                <Box width="fit-content" key={index}>
                  <NavLink key={menuOption} to={`${menuOption.toLowerCase()}`}>
                    <MenuItem
                      justifyContent="center"
                      borderRadius="full"
                      bg="transparent"
                      _hover={{ bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                      px={{ base: "3", lg: "4" }}
                      py="2"
                    >
                      <Text.P_Medium_Medium color={theme.textSecondary}>{menuOption}</Text.P_Medium_Medium>
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
            icon={<HamburgerIcon color={theme.text} />}
            variant="ghost"
            onClick={onOpen}
            display={{ base: "flex", md: "none" }}
            _hover={{ bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
          />
        )}

        {/* Desktop network switcher and wallet connection */}
        <Flex
          direction="row"
          gap="3"
          alignItems="center"
          display={{ base: "none", md: "flex" }}
          flexShrink={0}
          marginLeft="auto"
        >
          <ThemeToggle />
          <WalletConnection
            accountId={wallet.savedPairingData?.accountIds[0] ?? ""}
            connectionState={wallet.hashConnectConnectionState}
            accountBalances={wallet.pairedAccountBalance}
            isLoading={app.isFeatureLoading("pairedAccountBalance")}
            connectToWallet={wallet.connectToWallet}
            disconnectFromWallet={wallet.disconnectWallet}
          />
          <NetworkSwitcher />
        </Flex>
      </Menu>

      {/* Mobile Drawer Menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay bg="rgba(0,0,0,0.6)" backdropFilter="blur(4px)" />
        <DrawerContent bg={theme.bgSecondary} borderLeftWidth="1px" borderColor={theme.border}>
          <DrawerCloseButton color={theme.text} />
          <DrawerHeader borderBottomWidth="1px" borderColor={theme.border} color={theme.text}>
            Menu
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {props.menuOptions.map((menuOption, index) => (
                <NavLink key={index} to={`${menuOption.toLowerCase()}`} onClick={onClose}>
                  <Box py={3} px={4} borderRadius="12px" _hover={{ bg: theme.bgCardHover }} transition="all 0.2s">
                    <Text.P_Medium_Medium color={theme.text}>{menuOption}</Text.P_Medium_Medium>
                  </Box>
                </NavLink>
              ))}
              <Box pt={4} borderTopWidth="1px" borderColor={theme.border}>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text.P_Small_Regular color={theme.textSecondary}>Theme</Text.P_Small_Regular>
                    <ThemeToggle />
                  </Flex>
                  <NetworkSwitcher />
                  <WalletConnection
                    accountId={wallet.savedPairingData?.accountIds[0] ?? ""}
                    connectionState={wallet.hashConnectConnectionState}
                    accountBalances={wallet.pairedAccountBalance}
                    isLoading={app.isFeatureLoading("pairedAccountBalance")}
                    connectToWallet={wallet.connectToWallet}
                    disconnectFromWallet={wallet.disconnectWallet}
                  />
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
