import { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Menu,
  MenuItem,
  HStack,
  VStack,
  Grid,
  Box,
  Text,
  Center,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverHeader,
  Link,
  Skeleton,
  Circle,
  Flex,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useDexContext } from "../../hooks";
import { WalletConnectionStatus } from "../../store/walletSlice";
export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

const TopMenuBar = (props: TopMenuBarProps): JSX.Element => {
  const { app, context, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));
  const { network } = context;
  const { walletData, walletConnectionStatus: connectionStatus } = wallet;

  const getConnectionStatusColor = useCallback((): string => {
    if (
      connectionStatus === WalletConnectionStatus.INITIALIZING ||
      connectionStatus === WalletConnectionStatus.READY_TO_PAIR
    ) {
      return "tomato";
    }
    if (connectionStatus === WalletConnectionStatus.PAIRED) {
      if (walletData?.pairedAccountBalance?.hbars === undefined) {
        return "yellow";
      } else {
        return "green";
      }
    }
    return "grey";
  }, [walletData?.pairedAccountBalance?.hbars, connectionStatus]);

  return (
    <Menu>
      <Flex padding="2rem 1rem" w="100%" alignItems="center">
        <Box flex="1.5">
          <Text flex="1" textStyle="h5" padding="0.4rem 0">
            Hedera Open DEX
          </Text>
        </Box>
        <Box flex="1">
          <Center>
            {props.menuOptions.map((menuOption) => {
              return (
                <Box flex="1">
                  <RouterLink key={menuOption} to={`/${menuOption.toLowerCase()}`}>
                    <MenuItem justifyContent="center" _hover={{ bg: "gray.200" }}>
                      <Text textStyle="b2-bold">{menuOption}</Text>
                    </MenuItem>
                  </RouterLink>
                </Box>
              );
            })}
          </Center>
        </Box>
        <Box flex="1.5">
          <Box
            textAlign="right"
            float="right"
            borderRadius="8px"
            backgroundColor="#F2F2F4"
            minWidth="350px"
            width="fit-content"
          >
            <Grid templateColumns="repeat(2, 1fr)">
              <Skeleton padding="0.5em 1em" speed={0.4} fadeDuration={0} isLoaded={!app.isFeatureLoading("walletData")}>
                <Flex justifyContent="center" alignItems="center">
                  <Text textStyle="b2-bold">{walletData?.pairedAccountBalance?.hbars ?? "- ℏ"}</Text>
                </Flex>
              </Skeleton>
              <Popover>
                <PopoverTrigger>
                  <Button bg="black" color="white" padding="0.5em 1em">
                    <HStack>
                      <Circle size="1em" bg={getConnectionStatusColor()} />
                      <Text textStyle="b2-bold" color="white">
                        {walletData.pairedAccounts[0] ?? "Not Paired"}
                      </Text>
                    </HStack>
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
                    <Skeleton speed={0.4} fadeDuration={0} isLoaded={!app.isFeatureLoading("walletData")}>
                      <Text size="md" padding="0.4rem 0">
                        balance: <b style={{ color: "black" }}>{walletData?.pairedAccountBalance?.hbars ?? "-"}</b>
                      </Text>
                    </Skeleton>
                    <Link
                      color="#0180FF"
                      href={`https://hashscan.io/#/testnet/account/${walletData?.pairedAccounts?.[0]}`}
                      isExternal
                    >
                      <ExternalLinkIcon mx="1px" /> View on Hashscan
                    </Link>
                    <Button onClick={wallet.clearWalletPairings}>Disconnect From Wallet</Button>
                  </VStack>
                </PopoverContent>
              </Popover>
            </Grid>
          </Box>
        </Box>
      </Flex>
    </Menu>
  );
};

export { TopMenuBar };
