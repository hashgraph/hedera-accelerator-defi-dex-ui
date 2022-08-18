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
import { useHashConnectContext } from "../../../context";
import { WalletConnect } from "../../../components/WalletConnect/WalletConnect";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

const TopMenuBar = (props: TopMenuBarProps): JSX.Element => {

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
          <WalletConnect />
        </Box>
      </Grid>
    </Menu>
  );
};

export { TopMenuBar };
