import { useCallback, useEffect, useState } from "react";
import { Text, Flex, Spacer } from "@chakra-ui/react";
import { SwapTokensState } from "./types";
import { WarningIcon } from "@chakra-ui/icons";
import { AlertDialog, LoadingDialog, Button } from "../base";
import { Color } from "../themes";

export enum SwapConfirmationStep {
  CONFIRM, // Initial step/state
  SIGN, // When hashpack is awaiting signature
  TRANSACTION, // When transaction is signed in hashpack and is now executing (NOTE: currently cannot support)
  ERROR, // When there is an error with the executed transaction (for error dialog)
}

interface TokenPairs {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairContractId: string | undefined;
    tokenId: string | undefined;
  };
}
interface SwapConfirmationProps {
  sendSwapTransaction: (tokenToTrade: TokenPairs, tokenToReceive: TokenPairs) => void;
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
    sendSwapTransaction(tokenToTrade, tokenToReceive);
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
    return {
      minReceivedLabel: `Minimum received after slippage (${+swapSettings.slippage}%)`,
      pairDetails: {
        trade: `${tokenToTrade.amount} ${tokenToTrade.symbol}`,
        receive: `${tokenToReceive.amount.toFixed(5)} ${tokenToReceive.symbol}`,
      },
      swapSettings: {
        exchangeRate: `1 ${tokenToTrade.symbol} = ${spotPrice?.toFixed(5)} ${tokenToReceive.symbol}`,
        transactionFee: "0.01 HBAR", // TODO: update this with actual transaction fee
        gasFee: "0.01 HBAR", // TODO: update this with actual gas fee
        minReceivedAfterSlippage: getMinReceivedAfterSlippage(),
      },
    };
  }, [swapState, getMinReceivedAfterSlippage]);

  const SwapConfirmationModalBody = () => {
    const { minReceivedLabel, pairDetails, swapSettings } = swapData();
    return (
      <Flex flexDirection="column">
        <Flex paddingBottom="0.25rem">
          <Text flex="1" textStyle="b1">
            Receive
          </Text>
          <Text flex="3" textStyle="b1" textAlign="right">
            {pairDetails.receive}
          </Text>
        </Flex>
        <Flex>
          <Text flex="1" textStyle="b1">
            Trade
          </Text>
          <Text flex="3" textStyle="b1" textAlign="right">
            {pairDetails.trade}
          </Text>
        </Flex>
        <Spacer padding="0.667rem" />
        <Flex flexDirection="column" gap="0.5rem">
          <Flex>
            <Text flex="1" textStyle="b3" color={Color.Grey_02}>
              Exchange Rate
            </Text>
            <Text flex="2" textStyle="b3" textAlign="right">
              {swapSettings.exchangeRate}
            </Text>
          </Flex>
          <Flex>
            <Text flex="1" textStyle="b3" color={Color.Grey_02}>
              Transaction Fee
            </Text>
            <Text flex="2" textStyle="b3" textAlign="right">
              {swapSettings.transactionFee}
            </Text>
          </Flex>
          <Flex>
            <Text flex="1" textStyle="b3" color={Color.Grey_02}>
              Gas Fee
            </Text>
            <Text flex="2" textStyle="b3" textAlign="right">
              {swapSettings.gasFee}
            </Text>
          </Flex>
          <Flex>
            <Text flex="1" textStyle="b3" color={Color.Grey_02}>
              {minReceivedLabel}
            </Text>
            <Text flex="2" textStyle="b3" textAlign="right" verticalAlign="bottom">
              {swapSettings.minReceivedAfterSlippage}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  return (
    <>
      <AlertDialog
        title="Confirm Swap"
        openDialogButtonText={"Confirm Swap"}
        openDialogButtonStyles={{ flex: "1" }}
        body={SwapConfirmationModalBody()}
        footer={
          <Button flex="1" onClick={handleSwapTransaction}>
            Swap
          </Button>
        }
        alertDialogOpen={dialogsOpenState.alertDialog}
        onAlertDialogOpen={onSwapClick}
        onAlertDialogClose={() => setDialogsOpenState({ ...dialogsOpenState, alertDialog: false })}
      />
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
