import React, { useRef, useCallback } from "react";
import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { SwapState } from "../../Swap";

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
        <AlertDialogContent>
          <AlertDialogHeader>Confirm Swap</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to Swap {swapState.tokenToTrade.amount} {swapState.tokenToTrade.symbol} for
            {" " + swapState.tokenToReceive.amount} {swapState.tokenToReceive.symbol}?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleSwapTransaction}>
              Swap
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { SwapConfirmation };
