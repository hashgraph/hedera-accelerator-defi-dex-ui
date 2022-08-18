import { useEffect, useCallback, Dispatch } from "react";
import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { ActionType, HashConnectActions } from "./reducers/actionsTypes";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { ConnectionStatus } from "./types";

const useHashConnectEvents = (
  hashconnect: HashConnect,
  hashConnectState: HashConnectState,
  dispatch: Dispatch<HashConnectActions>,
  debug: boolean
) => {
  const handleFoundExtensionEvent = useCallback(
    (walletMetadata: HashConnectTypes.WalletMetadata) => {
      if (debug) console.debug("Found Extensions", walletMetadata);
      dispatch({ type: ActionType.ADD_INSTALLED_EXTENSION, payload: walletMetadata });
    },
    [dispatch, debug]
  );

  const handlePairingEvent = useCallback(
    (approvePairing: MessageTypes.ApprovePairing) => {
      if (debug) console.log("Paring Approved", approvePairing);
      dispatch({ type: ActionType.WALLET_PAIRING_APPROVED, field: "walletData", payload: approvePairing });
    },
    [dispatch, debug]
  );

  const handleAcknowledgeMessageEvent = useCallback((acknowledgeData: MessageTypes.Acknowledge) => {
    console.log("Ack Received", { acknowledgeData });
  }, []);

  const handleConnectionStatusChange = useCallback(
    (connectionStatus: ConnectionStatus) => {
      console.log("Hashpack Connection Status Received", { connectionStatus });
      dispatch({ type: ActionType.CONNECTION_STATUS_CHANGED, payload: connectionStatus });
    },
    [dispatch]
  );

  const handleTransactionEvent = useCallback((transaction: MessageTypes.Transaction) => {
    console.log("Transaction Received", { transaction });
  }, []);

  const handleAdditionalAccountRequestEvent = useCallback(
    (additionalAccountResponse: MessageTypes.AdditionalAccountRequest) => {
      console.log("Additional Account Response", { additionalAccountResponse });
    },
    []
  );

  useEffect(() => {
    if (debug) console.log("==== Setup Hashconnect Events ====");
    // events are fired when specific_event in hashconnect.<specific_event> is triggered/fired
    hashconnect.foundExtensionEvent.on(handleFoundExtensionEvent);
    hashconnect.pairingEvent.on(handlePairingEvent);
    hashconnect.acknowledgeMessageEvent.on(handleAcknowledgeMessageEvent);
    hashconnect.connectionStatusChange.on(handleConnectionStatusChange);
    hashconnect.transactionEvent.on(handleTransactionEvent);
    hashconnect.additionalAccountRequestEvent.on(handleAdditionalAccountRequestEvent);

    return () => {
      if (debug) console.log("==== Removing Hashconnect Event Handlers ====");
      hashconnect.foundExtensionEvent.off(handleFoundExtensionEvent);
      hashconnect.pairingEvent.off(handlePairingEvent);
      hashconnect.acknowledgeMessageEvent.off(handleAcknowledgeMessageEvent);
      hashconnect.connectionStatusChange.off(handleConnectionStatusChange);
      hashconnect.transactionEvent.off(handleTransactionEvent);
      hashconnect.additionalAccountRequestEvent.off(handleAdditionalAccountRequestEvent);
    };
  }, [
    debug,
    handleFoundExtensionEvent,
    handlePairingEvent,
    handleAcknowledgeMessageEvent,
    handleConnectionStatusChange,
    handleTransactionEvent,
    handleAdditionalAccountRequestEvent,
    hashconnect.acknowledgeMessageEvent,
    hashconnect.connectionStatusChange,
    hashconnect.foundExtensionEvent,
    hashconnect.pairingEvent,
    hashconnect.transactionEvent,
    hashconnect.additionalAccountRequestEvent,
  ]);
};

export { useHashConnectEvents };
