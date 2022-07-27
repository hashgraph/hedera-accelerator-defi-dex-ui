import React from "react";
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
} from "@chakra-ui/react";
import { useHashConnectContext } from "../../../context";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

const TopMenuBar = (props: TopMenuBarProps): JSX.Element => {
  const { walletData, network, connectionStatus, clearWalletPairings } = useHashConnectContext();

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
                <MenuItem w="auto" fontWeight="500" _hover={{ bg: "gray.600" }}>
                  {menuOption}
                </MenuItem>
              );
            })}
          </HStack>
        </Center>
        <Box textAlign="right">
          <Popover>
            <PopoverTrigger>
              <Button bg="rgb(36, 38, 76)" color="white" size="sm" padding="15px" width="fit-content">
                <Box w="100%" marginRight="20px">
                  <HStack>
                    <Text marginRight="5px">Balance:</Text>
                    <Text fontWeight="bold" color="rgb(80, 144, 234)">
                      {"-"}
                    </Text>
                  </HStack>
                </Box>
                <Box w="100%">
                  <HStack>
                    <Text marginRight="5px">Status:</Text>
                    <Text fontWeight="bold" color="rgb(80, 144, 234)">
                      {connectionStatus || "Not paired"}
                    </Text>
                  </HStack>
                </Box>
              </Button>
            </PopoverTrigger>
            <PopoverContent bg="rgb(36, 38, 76)" color="white" textAlign="center">
              <PopoverHeader fontWeight="bold">Account</PopoverHeader>
              <VStack>
                <Text size="md" padding="0.4rem 0">
                  network: <b style={{ color: "rgb(80, 144, 234)" }}>{network || "-"}</b>
                </Text>
                <Text size="md" padding="0.4rem 0">
                  account: <b style={{ color: "rgb(80, 144, 234)" }}>{walletData?.pairedAccounts?.[0] || "-"}</b>
                </Text>
                <Text size="md" padding="0.4rem 0">
                  wallet type: <b style={{ color: "rgb(80, 144, 234)" }}>{walletData?.pairedWalletData?.name || "-"}</b>
                </Text>
                <Text size="md" padding="0.4rem 0">
                  balance: <b style={{ color: "rgb(80, 144, 234)" }}>-</b>
                </Text>
                <Button onClick={clearWalletPairings} variant="secondary">
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
