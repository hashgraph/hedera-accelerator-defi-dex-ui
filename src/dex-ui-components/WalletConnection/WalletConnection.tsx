import { AccountBalanceJson } from "@hashgraph/sdk";
import {
  HStack,
  Grid,
  Text,
  Center,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Link,
  Skeleton,
  Circle,
  Flex,
  Spinner,
  GridItem,
  chakra,
} from "@chakra-ui/react";
import { ChevronDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { ReactElement, useEffect, useRef, useState } from "react";
import { Color, AlertDialog, Button } from "../";
import { formatWalletConnectionData } from "./formatter";

/** TODO: Replace this with the real terms and service agreement. */
const TermsAndServices = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Nisl nunc mi ipsum faucibus vitae aliquet nec. Consectetur libero id faucibus nisl. 
Sagittis aliquam malesuada bibendum arcu vitae elementum. 
In metus vulputate eu scelerisque felis imperdiet. Elit eget gravida cum sociis. 
Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper. 
Urna nec tincidunt praesent semper feugiat nibh sed. Nibh cras pulvinar mattis nunc. 
Erat nam at lectus urna duis convallis convallis tellus id. Aliquet risus feugiat in 
ante metus dictum at. Tristique senectus et netus et malesuada fames ac turpis. 
Mollis nunc sed id semper risus in hendrerit. In`;

export interface WalletConnectionProps {
  /** The account ID the application is paired with. */
  accountId: string;
  /** The state of the connection between a wallet and the application. */
  connectionState: HashConnectConnectionState;
  /** Token balances for the accountId read from the paired wallet. */
  accountBalances: AccountBalanceJson | null;
  /** true if data to be displayed is being fetched. */
  isLoading: boolean;
  /** The function called to pair with a connected wallet. */
  connectToWallet: () => void;
  /** The function called when disconnecting (unpairing) from an account. */
  disconnectFromWallet: () => void;
}

/**
 * The Wallet Connection component is a set of components used to connect to and disconnect
 * from a wallet and display important account information.
 * @param props - {@link WalletConnectionProps}
 * @returns The Wallet Connection component.
 */
export const WalletConnectionBase = (props: WalletConnectionProps): ReactElement => {
  const { accountId, connectionState, isLoading, connectToWallet, disconnectFromWallet } = props;
  const { hashScanAccountLink, formattedHbarAmount, connectionNotification, connectionStatusColor } =
    formatWalletConnectionData(props);
  /**
   * A reference that tracks a timeout used to limit the length of time a
   * user has to approve a wallet pairing request.
   */
  const connectionTimeoutId = useRef<NodeJS.Timeout | null>(null);
  /**
   * true if the application is waiting for a pairing approval event from the wallet.
   * Will be set to false if the timeout is reached before the user approves the pairing
   * event in their wallet.
   */
  const [isConnecting, setIsConnecting] = useState(false);
  /**
   * Tracks if the alert dialog modal should be displayed or hidden.
   */
  const [dialogState, setDialogState] = useState(false);
  const isConnectedOrDisconnected = !isConnecting && connectionState !== HashConnectConnectionState.Paired;
  const hasPaired = isConnecting && connectionState === HashConnectConnectionState.Paired;

  useEffect(() => {
    if (hasPaired) {
      if (connectionTimeoutId.current !== null) {
        clearTimeout(connectionTimeoutId.current);
      }
      setIsConnecting(false);
    }
  }, [hasPaired]);

  useEffect(() => {
    if (isConnecting) {
      connectionTimeoutId.current = setTimeout(() => {
        setIsConnecting(false);
      }, 10000);
      return () => {
        if (connectionTimeoutId.current !== null) {
          clearTimeout(connectionTimeoutId.current);
          /** TODO: Add Wallet Connection timeout messaging. */
        }
      };
    }
  }, [isConnecting]);

  const handleClickConnect = () => {
    setDialogState(false);
    setIsConnecting(true);
    connectToWallet();
  };

  const handleClickDisconnect = () => {
    disconnectFromWallet();
  };

  const handleOpenDialog = () => {
    setDialogState(true);
  };

  const handleCloseDialog = () => {
    setDialogState(false);
  };

  if (isConnecting) {
    return (
      <Button textStyle="h3" isDisabled={true}>
        Waiting to Connect
        <Spinner marginLeft="0.5rem" color="#31A9BD" thickness="4px" speed="0.65s" emptyColor="gray.200" h={4} w={4} />
      </Button>
    );
  }

  if (isConnectedOrDisconnected) {
    return (
      <AlertDialog
        openDialogButtonStyles={{ flex: "1" }}
        title="Terms and Services"
        openModalComponent={<Button textStyle="h3">Connect to a Wallet</Button>}
        body={<Text textStyle="b3">{TermsAndServices}</Text>}
        footer={
          <Button flex="1" onClick={handleClickConnect}>
            Agree & Connect
          </Button>
        }
        alertDialogOpen={dialogState}
        onAlertDialogOpen={handleOpenDialog}
        onAlertDialogClose={handleCloseDialog}
      />
    );
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)">
      <Flex justifyContent="center" alignItems="center">
        <Skeleton width="100%" padding="0.5em 1em" speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
          <Text textStyle="h3">{formattedHbarAmount}</Text>
        </Skeleton>
      </Flex>
      <Popover>
        <PopoverTrigger>
          <Button bg="black" color="white" padding="0.5em 1em" borderRadius="0.5rem">
            <HStack>
              <Circle size="1em" bg={connectionStatusColor} />
              <Text textStyle="h3" color="white">
                {accountId}
              </Text>
              <ChevronDownIcon textStyle="h3" />
            </HStack>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          bg={Color.Black_01}
          padding="1rem"
          marginRight="1rem"
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.15)"
        >
          <Flex direction="column" gap="4">
            {connectionNotification}
            <Grid templateColumns="repeat(3, 1fr)">
              <GridItem justifySelf="left" colSpan={1}>
                <Text textStyle="h4" color={Color.White_01} marginBottom="1rem">
                  Coins
                </Text>
                <Text textStyle="b3" color={Color.White_01}>
                  HBAR
                </Text>
              </GridItem>
              <GridItem justifySelf="right" colSpan={1}>
                <Text textStyle="h4" color={Color.White_01} marginBottom="1rem">
                  In Wallet
                </Text>
                <Text textStyle="b3" color={Color.White_01}>
                  {formattedHbarAmount}
                </Text>
              </GridItem>
              <GridItem justifySelf="right" colSpan={1}>
                <Text textStyle="h4" color={Color.White_01} marginBottom="1rem">
                  Price
                </Text>
                <Text textStyle="b3" color={Color.White_01}>
                  -
                </Text>
              </GridItem>
            </Grid>
            <Center gap="2">
              <Link href={hashScanAccountLink} isExternal>
                <Text textStyle="link">
                  <ExternalLinkIcon color={Color.Teal_01} w={5} h={5} marginRight="0.5rem" marginBottom="0.125rem" />
                  View on Hashscan
                </Text>
              </Link>
            </Center>
            <Center>
              <Button variant="ternary" onClick={handleClickDisconnect}>
                Disconnect Wallet
              </Button>
            </Center>
          </Flex>
        </PopoverContent>
      </Popover>
    </Grid>
  );
};

const WalletConnection = chakra(WalletConnectionBase);
export { WalletConnection };
