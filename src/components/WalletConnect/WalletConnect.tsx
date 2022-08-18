import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Link,
  Popover,
  PopoverTrigger,
  Button,
  HStack,
  PopoverContent,
  PopoverHeader,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useHashConnectContext } from "../../context";
import { SwapProps } from "../Swap";
import { WalletConnectionStatus } from "../../hooks/useHashConnect";

const WalletConnect = () => {
  // const { walletData, network, connectionStatus, clearWalletPairings } = useHashConnectContext();

  const { connectToWallet, installedExtensions, connectToBlade } = useHashConnectContext();
  console.log(installedExtensions);

  const [walletConnectState, setState] = useState({
    connectionStatus: WalletConnectionStatus.READY_TO_PAIR,
    connectedWalletAccountId: null,
    connectModalOpen: false,
  });

  const onWalletConnectClick = () => {
    console.log("Connect to a Wallet clicked");
    if (walletConnectState.connectionStatus === WalletConnectionStatus.READY_TO_PAIR) {
      setState({
        ...walletConnectState,
        connectionStatus: WalletConnectionStatus.INITIALIZING,
        connectModalOpen: true,
      });
    }
  };

  const onConnectionModalClose = () => {
    setState({
      ...walletConnectState,
      connectionStatus: WalletConnectionStatus.READY_TO_PAIR,
      connectModalOpen: false,
    });
  };

  const connectToHashPack = () => {
    console.log("connect to hashpack clicked");
    connectToWallet();
  };

  const connectToBladeWallet = () => {
    console.log("connect to blade clicked");
    connectToBlade();
  };

  return (
    <>
      <Button
        bg="black"
        color="white"
        size="sm"
        padding="16px 24px"
        width="fit-content"
        isLoading={walletConnectState.connectionStatus === WalletConnectionStatus.INITIALIZING}
        loadingText="Waiting to Connect"
        spinnerPlacement="end"
        onClick={onWalletConnectClick}
      >
        {walletConnectState.connectionStatus === WalletConnectionStatus.READY_TO_PAIR
          ? "Connect to a Wallet"
          : walletConnectState.connectionStatus === WalletConnectionStatus.INITIALIZING
          ? "Waiting to Connect"
          : walletConnectState.connectedWalletAccountId}
      </Button>
      <Modal isOpen={walletConnectState.connectModalOpen} onClose={onConnectionModalClose}>
        <ModalOverlay />
        <ModalContent w="300px" p="12px" backgroundColor="black" color="white">
          <ModalHeader p="0px" fontSize="16px" fontWeight="700">
            Connect to a Wallet
          </ModalHeader>
          <ModalCloseButton right="4px" />
          <ModalBody p="0px" mt="14px">
            {installedExtensions && installedExtensions.length > 0 ? (
              <Button
                m="0px"
                p="0px"
                backgroundColor="#4D4D4D"
                borderColor="#4D4D4D"
                borderRadius="5px"
                onClick={connectToHashPack}
              >
                Hashpack
              </Button>
            ) : (
              <Button>Install HashPack</Button>
            )}
            {window.bladeConnect ? (
              <Button
                m="4px 0px 0px"
                p="0px"
                backgroundColor="#4D4D4D"
                borderColor="#4D4D4D"
                borderRadius="5px"
                onClick={connectToBladeWallet}
              >
                Blade
              </Button>
            ) : (
              <Button>Install Blade</Button>
            )}
          </ModalBody>
          <ModalFooter p="6px" mt="8px" fontSize="10px" lineHeight="12px">
            Lorem ipsum terms and services messaging if necessary goes here.
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
    // <Popover>
    //     <PopoverTrigger>
    //         <Button bg="black" color="white" size="sm" padding="15px" width="fit-content">
    //             <Box w="100%" marginRight="20px">
    //                 <HStack>
    //                     <Text marginRight="5px">Balance:</Text>
    //                     <Text fontWeight="bold" color="white">
    //                         {walletData?.pairedAccountBalance?.hbars ?? "-"}
    //                     </Text>
    //                 </HStack>
    //             </Box>
    //             <Box w="100%">
    //                 <HStack>
    //                     <Text marginRight="5px">Status:</Text>
    //                     <Text fontWeight="bold" color="white">
    //                         {connectionStatus || "Not paired"}
    //                     </Text>
    //                 </HStack>
    //             </Box>
    //         </Button>
    //     </PopoverTrigger>
    //     <PopoverContent bg="white" color="black" textAlign="center">
    //         <PopoverHeader fontWeight="bold">Account</PopoverHeader>
    //         <VStack>
    //             <Text size="md" padding="0.4rem 0">
    //                 network: <b style={{ color: "black" }}>{network || "-"}</b>
    //             </Text>
    //             <Text size="md" padding="0.4rem 0">
    //                 account: <b style={{ color: "black" }}>{walletData?.pairedAccounts?.[0] || "-"}</b>
    //             </Text>
    //             <Text size="md" padding="0.4rem 0">
    //                 wallet type: <b style={{ color: "black" }}>{walletData?.pairedWalletData?.name || "-"}</b>
    //             </Text>
    //             <Text size="md" padding="0.4rem 0">
    //                 balance: <b style={{ color: "black" }}>{walletData?.pairedAccountBalance?.hbars ?? "-"}</b>
    //             </Text>
    //             <Link
    //                 color="#0180FF"
    //                 href={`https://hashscan.io/#/testnet/account/${walletData?.pairedAccounts?.[0]}`}
    //                 isExternal
    //             >
    //                 <ExternalLinkIcon mx="1px" /> View on Hashscan
    //             </Link>
    //             <Button onClick={clearWalletPairings} variant="secondary">
    //                 Disconnect From Wallet
    //             </Button>
    //         </VStack>
    //     </PopoverContent>
    // </Popover>
  );
};

export { WalletConnect };
