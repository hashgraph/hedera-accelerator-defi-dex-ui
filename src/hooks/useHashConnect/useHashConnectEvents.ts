import { useEffect, useCallback, Dispatch } from "react";
import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { ActionType, HashConnectAction } from "./actions/actionsTypes";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { ConnectionStatus } from "./types";

const useHashConnectEvents = (
  hashconnect: HashConnect,
  hashConnectState: HashConnectState,
  dispatch: Dispatch<HashConnectAction>,
  debug: boolean
) => {
  const handleFoundExtensionEvent = useCallback(
    (walletMetadata: HashConnectTypes.WalletMetadata) => {
      dispatch({ type: ActionType.ADD_INSTALLED_EXTENSION, payload: walletMetadata });
    },
    [dispatch]
  );

  const handlePairingEvent = useCallback(
    (approvePairing: MessageTypes.ApprovePairing) => {
      dispatch({ type: ActionType.WALLET_PAIRING_APPROVED, field: "walletData", payload: approvePairing });
    },
    [dispatch]
  );

  const handleAcknowledgeMessageEvent = useCallback((acknowledgeData: MessageTypes.Acknowledge) => {
    console.log("Ack Received", { acknowledgeData });
  }, []);

  const handleConnectionStatusChange = useCallback(
    (connectionStatus: ConnectionStatus) => {
      dispatch({ type: ActionType.RECEIVED_CONNECTION_STATUS_CHANGED, payload: connectionStatus });
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
    hashconnect.foundExtensionEvent.on(handleFoundExtensionEvent);
    hashconnect.pairingEvent.on(handlePairingEvent);
    hashconnect.acknowledgeMessageEvent.on(handleAcknowledgeMessageEvent);
    hashconnect.connectionStatusChangeEvent.on(handleConnectionStatusChange);
    hashconnect.transactionEvent.on(handleTransactionEvent);
    hashconnect.additionalAccountRequestEvent.on(handleAdditionalAccountRequestEvent);

    return () => {
      if (debug) console.log("==== Removing Hashconnect Event Handlers ====");
      hashconnect.foundExtensionEvent.off(handleFoundExtensionEvent);
      hashconnect.pairingEvent.off(handlePairingEvent);
      hashconnect.acknowledgeMessageEvent.off(handleAcknowledgeMessageEvent);
      hashconnect.connectionStatusChangeEvent.off(handleConnectionStatusChange);
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
    hashconnect.connectionStatusChangeEvent,
    hashconnect.foundExtensionEvent,
    hashconnect.pairingEvent,
    hashconnect.transactionEvent,
    hashconnect.additionalAccountRequestEvent,
  ]);
};

export { useHashConnectEvents };
