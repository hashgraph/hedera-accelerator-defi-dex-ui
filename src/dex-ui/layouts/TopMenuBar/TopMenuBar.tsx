import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Menu,
  MenuItem,
  HStack,
  VStack,
  Grid,
  Box,
  Heading,
  Text,
  Center,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverHeader,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useDexContext } from "../../hooks";
export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

const TopMenuBar = (props: TopMenuBarProps): JSX.Element => {
  const [context, wallet] = useDexContext(({ context, wallet }) => [context, wallet]);
  const { network } = context;
  const { walletData, walletConnectionStatus: connectionStatus } = wallet;

  return (
    <Menu>
      <Grid templateColumns="repeat(3, 1fr)" gap={6} padding="2rem 1rem" marginBottom="4rem" w="100%">
        <Heading as="h1" size="md" fontWeight="900" padding="0.4rem 0">
          Hedera Open DEX
        </Heading>
        <Center>
          <HStack spacing="24px">
            {props.menuOptions.map((menuOption) => {
              return (
                <RouterLink key={menuOption} to={`/${menuOption.toLowerCase()}`}>
                  <MenuItem w="auto" fontWeight="500" _hover={{ bg: "gray.600" }}>
                    {menuOption}
                  </MenuItem>
                </RouterLink>
              );
            })}
          </HStack>
        </Center>
        <Box textAlign="right">
          <Popover>
            <PopoverTrigger>
              <Button bg="black" color="white" size="sm" padding="15px" width="fit-content">
                <Box w="100%" marginRight="20px">
                  <HStack>
                    <Text marginRight="5px">Balance:</Text>
                    <Text fontWeight="bold" color="white">
                      {walletData?.pairedAccountBalance?.hbars ?? "-"}
                    </Text>
                  </HStack>
                </Box>
                <Box w="100%">
                  <HStack>
                    <Text marginRight="5px">Status:</Text>
                    <Text fontWeight="bold" color="white">
                      {connectionStatus || "Not paired"}
                    </Text>
                  </HStack>
                </Box>
              </Button>
            </PopoverTrigger>
            <PopoverContent bg="white" color="black" textAlign="center">
              <PopoverHeader fontWeight="bold">Account</PopoverHeader>
              <VStack>
                <Text size="md" padding="0.4rem 0">
                  network: <b style={{ color: "black" }}>{network || "-"}</b>
                </Text>
                <Text size="md" padding="0.4rem 0">
                  account: <b style={{ color: "black" }}>{walletData?.pairedAccounts?.[0] || "-"}</b>
                </Text>
                <Text size="md" padding="0.4rem 0">
                  wallet type: <b style={{ color: "black" }}>{walletData?.pairedWalletData?.name || "-"}</b>
                </Text>
                <Text size="md" padding="0.4rem 0">
                  balance: <b style={{ color: "black" }}>{walletData?.pairedAccountBalance?.hbars ?? "-"}</b>
                </Text>
                <Link
                  color="#0180FF"
                  href={`https://hashscan.io/#/testnet/account/${walletData?.pairedAccounts?.[0]}`}
                  isExternal
                >
                  <ExternalLinkIcon mx="1px" /> View on Hashscan
                </Link>
                <Button onClick={wallet.clearWalletPairings} variant="secondary">
                  Disconnect From Wallet
                </Button>
              </VStack>
            </PopoverContent>
          </Popover>
        </Box>
      </Grid>
    </Menu>
  );
};

export { TopMenuBar };
