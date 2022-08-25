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
import { SwapState } from "../../Swap/reducers";
import { tokenSymbolToAccountID } from "../../Swap";

interface SwapConfirmationProps {
  sendSwapTransaction: (payload: any) => void;
  swapState: SwapState;
}

const SwapConfirmation = (props: SwapConfirmationProps) => {
  const { sendSwapTransaction, swapState } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();

  const handleSwapTransaction = useCallback(async () => {
    const { inputToken, outputToken } = swapState;
    const inputTokenAccountId = tokenSymbolToAccountID.get(inputToken.symbol) ?? "";
    const outputTokenAccountId = tokenSymbolToAccountID.get(outputToken.symbol) ?? "";
    sendSwapTransaction({
      depositTokenAccountId: inputTokenAccountId,
      depositTokenAmount: inputToken.amount,
      receivingTokenAccountId: outputTokenAccountId,
      receivingTokenAmount: outputToken.amount,
    });
  }, [sendSwapTransaction, swapState]);

  return (
    <>
      <Button onClick={onOpen}>Swap</Button>
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
            Are you sure you want to Swap {swapState.inputToken.amount} {swapState.inputToken.symbol} for
            {" " + swapState.outputToken.amount} {swapState.outputToken.symbol}?
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
