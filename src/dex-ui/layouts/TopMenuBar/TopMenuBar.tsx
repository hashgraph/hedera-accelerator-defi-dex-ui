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
  Tag,
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
      <Flex
        padding="2rem 1rem"
        marginBottom="3rem"
        w="100%"
        height="84px"
        alignItems="center"
        borderBottom="0.25px solid #DBDEDF"
      >
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
            <Grid templateColumns="repeat(2, 1fr)">
              <Flex justifyContent="center" alignItems="center">
                <Skeleton
                  padding="0.5em 1em"
                  speed={0.4}
                  fadeDuration={0}
                  isLoaded={!app.isFeatureLoading("walletData")}
                >
                  <Text textStyle="h3">{walletData?.pairedAccountBalance?.hbars ?? "- ℏ"}</Text>
                </Skeleton>
              </Flex>
              <Popover>
                <PopoverTrigger>
                  <Button bg="black" color="white" padding="0.5em 1em">
                    <HStack>
                      <Circle size="1em" bg={getConnectionStatusColor()} />
                      <Text textStyle="h3" color="white">
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
