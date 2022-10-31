import { useCallback, useEffect, useState } from "react";
import { Flex, Divider } from "@chakra-ui/react";
import { SwapTokensState } from "./types";
import { WarningIcon } from "@chakra-ui/icons";
import { LoadingDialog } from "../base/Dialogs/LoadingDialog";
import { AlertDialogComponent } from "../base";

export enum SwapConfirmationStep {
  CONFIRM, // Initial step/state
  SIGN, // When hashpack is awaiting signature
  TRANSACTION, // When transaction is signed in hashpack and is now executing (NOTE: currently cannot support)
  ERROR, // When there is an error with the executed transaction (for error dialog)
}
interface SwapConfirmationProps {
  sendSwapTransaction: (payload: any) => void;
  swapState: SwapTokensState;
  confirmationStep: SwapConfirmationStep;
  errorMessage?: string;
  onErrorMessageDismiss?: () => void | undefined; // fired when error dialog is closed (SwapConfirmationStep.ERROR)
  onSwapButtonClick?: () => void | undefined; // fired when swap button is clicked (button starts dialog flow)
  onClose?: () => void | undefined; // fired when swap setting AlertDialog is closed (sendSwapTransaction)
}

const SwapConfirmation = (props: SwapConfirmationProps) => {
  const { sendSwapTransaction, swapState, confirmationStep, errorMessage, onErrorMessageDismiss, onSwapButtonClick } =
    props;

  const [dialogsOpenState, setDialogsOpenState] = useState({
    errorDialog: true,
    signingDialog: true,
    transactionDialog: true,
    alertDialog: false,
  });
  useEffect(() => {
    // confirmationStep will be updated by TransactionState slice in HashconnectState
    // which is updated after transaction is executed
    setDialogsOpenState({
      ...dialogsOpenState,
      errorDialog: confirmationStep === SwapConfirmationStep.ERROR,
      signingDialog: confirmationStep === SwapConfirmationStep.SIGN,
      transactionDialog: confirmationStep === SwapConfirmationStep.TRANSACTION,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmationStep]);

  /**
   * OnClick of Swap button (AlertDialog trigger). Sets local alertDialog open state to true
   * ie opens AlertDialog with swap settings/confirmation. Fires onSwapButtonClick prop
   */
  const onSwapClick = () => {
    setDialogsOpenState({ ...dialogsOpenState, alertDialog: true });
    if (onSwapButtonClick) onSwapButtonClick();
  };

  /**
   * OnClick of Confirm Swap button in the swap settings/confirmation AlertDialog.
   * Sends swap transaction to wallet to sign. AlertDialog is closed and onClose prop is fired
   */
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
    setDialogsOpenState({ ...dialogsOpenState, alertDialog: false });
    if (props.onClose) props.onClose();
  }, [sendSwapTransaction, swapState, props, dialogsOpenState]);

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

  /**
   * Returns data to be displayed in swap settings/confirm AlertDialog
   */
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
      {/* Swap settings/Confirmation Dialog */}
      <AlertDialogComponent
        title="Swap"
        openDialogButtonText={"Swap"}
        modalButtonText={"Confirm Swap"}
        onModalButtonClick={handleSwapTransaction}
        alertDialogOpen={dialogsOpenState.alertDialog}
        onAlertDialogOpen={onSwapClick}
        onAlertDialogClose={() => setDialogsOpenState({ ...dialogsOpenState, alertDialog: false })}
      >
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
      </AlertDialogComponent>
      {confirmationStep === SwapConfirmationStep.SIGN ? (
        // Sign transaction dialog
        <LoadingDialog
          isOpen={dialogsOpenState.signingDialog}
          message={"Please confirm the swap in your wallet to proceed"}
        />
      ) : confirmationStep === SwapConfirmationStep.ERROR ? (
        <LoadingDialog
          isOpen={dialogsOpenState.errorDialog}
          message={errorMessage ?? ""}
          icon={<WarningIcon h={10} w={10} />}
          buttonConfig={{
            text: "Dismiss",
            onClick: () => {
              setDialogsOpenState({ ...dialogsOpenState, errorDialog: false });
              if (onErrorMessageDismiss) onErrorMessageDismiss();
            },
          }}
        />
      ) : confirmationStep === SwapConfirmationStep.TRANSACTION ? (
        // Transaction processing dialog
        // TODO: add transaction id
        <LoadingDialog
          isOpen={dialogsOpenState.transactionDialog}
          message={"Processing Transaction ABC12345. This may take several minutes."}
        />
      ) : (
        ""
      )}
    </>
  );
};

export { SwapConfirmation };
