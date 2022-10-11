import { useRef, useCallback, useEffect, useState } from "react";
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
import { CloseIcon, WarningIcon } from "@chakra-ui/icons";
import { LoadingDialog } from "./LoadingDialog";

export enum SwapConfirmationStep {
  CONFIRM, // Initial step/state
  SIGN, // When hashpack is awaiting signature
  TRANSACTION, // When transaction is signed in hashpack and is now executing (NOTE: currently cannot support)
  ERROR, // When there is an error with the executed transaction (for error dialog)
}
interface SwapConfirmationProps {
  sendSwapTransaction: (payload: any) => void;
  swapState: SwapState;
  confirmationStep: SwapConfirmationStep;
  errorMessage?: string;
  onErrorMessageDismiss?: () => void | undefined; // fired when error dialog is closed (SwapConfirmationStep.ERROR)
  onSwapButtonClick?: () => void | undefined; // fired when swap button is clicked (button starts dialog flow)
  onClose?: () => void | undefined; // fired when swap setting AlertDialog is closed (sendSwapTransaction)
}

const SwapConfirmation = (props: SwapConfirmationProps) => {
  const { sendSwapTransaction, swapState, confirmationStep, errorMessage, onErrorMessageDismiss, onSwapButtonClick } =
    props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();

  const [errorDialogOpen, setErrorDialogOpen] = useState(true);
  useEffect(() => {
    // confirmationStep will be updated by TransactionState slice in HashconnectState
    // which is updated after transaction is executed
    if (confirmationStep === SwapConfirmationStep.ERROR) {
      setErrorDialogOpen(true);
    }
  }, [confirmationStep]);

  // OnClick of Swap button. Opens AlertDialog with swap settings/confirmation and fires
  // onSwapButtonClick prop
  const onSwapClick = () => {
    onOpen();
    if (onSwapButtonClick) onSwapButtonClick();
  };

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
    // close AlertDialog with swap settings/confirmation and fire onClose prop
    onClose();
    if (props.onClose) props.onClose();
  }, [sendSwapTransaction, swapState, onClose, props]);

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
    const minReceivedKey = `Minimum received after slippage (${+swapSettings.slippage}%)`;
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
      <Button onClick={onSwapClick} marginTop="0.5rem">
        Swap
      </Button>
      {/* // Confirm Swap Dialog */}
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
                      key={i}
                    >
                      <dt style={{ width: "50%" }}>{key}</dt>
                      <dd style={{ width: "50%", textAlign: "right" }}>{swapData().pairDetails[key]}</dd>
                    </Flex>
                  );
                })}
                <Divider borderColor={"#000000"} marginBottom={"8px"} />
                {Object.keys(swapData().swapSettings).map((key: string, i: number) => {
                  return (
                    <Flex
                      justifyContent={"space-between"}
                      width={"100%"}
                      marginBottom={"8px"}
                      fontSize={"14px"}
                      lineHeight={"17px"}
                      key={i}
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
      {confirmationStep === SwapConfirmationStep.SIGN ? (
        // Sign transaction dialog
        <LoadingDialog isOpen={true} message={"Please confirm the swap in your wallet to proceed"} />
      ) : confirmationStep === SwapConfirmationStep.ERROR ? (
        <LoadingDialog
          isOpen={errorDialogOpen}
          message={errorMessage ?? ""}
          icon={<WarningIcon h={10} w={10} />}
          buttonConfig={{
            text: "Dismiss",
            onClick: () => {
              setErrorDialogOpen(false);
              if (onErrorMessageDismiss) onErrorMessageDismiss();
            },
          }}
        />
      ) : confirmationStep === SwapConfirmationStep.TRANSACTION ? (
        // Transaction processing dialog
        // TODO: add transaction id
        <LoadingDialog isOpen={true} message={"Processing Transaction ABC12345. This may take several minutes."} />
      ) : (
        ""
      )}
    </>
  );
};

export { SwapConfirmation };
