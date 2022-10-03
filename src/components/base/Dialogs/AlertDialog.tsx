import { useRef, useCallback } from "react";
import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Flex,
  Divider,
  Text,
} from "@chakra-ui/react";
import { SwapState } from "../../Swap";
import { CloseIcon } from "@chakra-ui/icons";

interface SwapConfirmationProps {
  sendSwapTransaction: (payload: any) => void;
  swapState: SwapState;
}

const SwapConfirmation = (props: SwapConfirmationProps) => {
  const { sendSwapTransaction, swapState } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();

  const handleSwapTransaction = useCallback(async () => {
    const { tokenToTrade, tokenToReceive } = swapState;
    if (tokenToTrade.symbol === undefined || tokenToReceive.symbol === undefined) {
      console.error("Token types must be selected to Swap tokens.");
      return;
    }
    sendSwapTransaction({
      tokenToTrade: { ...tokenToTrade },
      tokenToReceive: { ...tokenToReceive },
    });
  }, [sendSwapTransaction, swapState]);

  /**
   * Calculates minimum received amount after slippage
   * Min Received = Receive Amount - (Receive Amount * slippage percentage)
   */
  const getMinReceivedAfterSlippage = useCallback(() => {
    const receiveAmount = swapState.tokenToReceive.amount;
    const tokenToReceive = swapState.tokenToReceive.symbol;
    const slippage = +swapState.swapSettings.slippage / 100;
    return `${(receiveAmount - receiveAmount * slippage).toFixed(7)} ${tokenToReceive}`;
  }, [swapState]);

  const swapData = useCallback((): { [key: string]: any } => {
    const { tokenToTrade, tokenToReceive, swapSettings, spotPrice } = swapState;
    const minReceivedKey = `Minimum received after slippage (${+swapSettings.slippage / 100}%)`;
    return {
      pairDetails: {
        Trade: `${tokenToTrade.amount} ${tokenToTrade.symbol}`,
        Receive: `${tokenToReceive.amount.toFixed(5)} ${tokenToReceive.symbol}`,
      },
      swapSettings: {
        "Exchange Rate": `1 ${tokenToTrade.symbol} = ${spotPrice?.toFixed(5)} ${tokenToReceive.symbol}`,
        "Transaction Fee": "0.01 HBAR", // TODO: update this with actual transaction fee
        "Gas Fee": "0.01 HBAR", // TODO: update this with actual gas fee
        [minReceivedKey]: getMinReceivedAfterSlippage(),
      },
    };
  }, [swapState, getMinReceivedAfterSlippage]);

  return (
    <>
      <Button onClick={onOpen} marginTop="0.5rem">
        Swap
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent width={"370px"}>
          <AlertDialogHeader padding={"16px"} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize={"24px"} lineHeight={"29px"} fontWeight={"400"}>
              Confirm Swap
            </Text>
            <CloseIcon w={4} h={4} onClick={onClose} cursor={"pointer"} />
          </AlertDialogHeader>
          <AlertDialogBody padding={"0 16px"}>
            <dl>
              <Flex flexDirection={"column"} width={"100%"}>
                {Object.keys(swapData().pairDetails).map((key: string, i: number) => {
                  return (
                    <Flex
                      justifyContent={"space-between"}
                      width={"100%"}
                      marginBottom={i === 0 ? "4px" : "8px"}
                      fontSize={"18px"}
                      lineHeight={"22px"}
                    >
                      <dt style={{ width: "50%" }}>{key}</dt>
                      <dd style={{ width: "50%", textAlign: "right" }}>{swapData().pairDetails[key]}</dd>
                    </Flex>
                  );
                })}
                <Divider borderColor={"#000000"} marginBottom={"8px"} />
                {Object.keys(swapData().swapSettings).map((key: string) => {
                  return (
                    <Flex
                      justifyContent={"space-between"}
                      width={"100%"}
                      marginBottom={"8px"}
                      fontSize={"14px"}
                      lineHeight={"17px"}
                    >
                      <dt style={{ width: "50%" }}>{key}</dt>
                      <dd style={{ width: "50%", textAlign: "right" }}>{swapData().swapSettings[key]}</dd>
                    </Flex>
                  );
                })}
              </Flex>
            </dl>
          </AlertDialogBody>
          <AlertDialogFooter padding={"16px"}>
            <Button width={"100%"} ref={cancelRef} onClick={handleSwapTransaction}>
              Confirm Swap
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { SwapConfirmation };
