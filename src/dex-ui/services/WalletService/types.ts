import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { HashConnectTypes, MessageTypes } from "hashconnect";

interface HashConnectEventHandlers {
  handleFoundExtensionEvent: (walletMetadata: HashConnectTypes.WalletMetadata) => void;
  handlePairingEvent: (approvePairing: MessageTypes.ApprovePairing) => void;
  handleAcknowledgeMessageEvent: (acknowledgeData: MessageTypes.Acknowledge) => void;
  handleConnectionStatusChangeEvent: (connectionStatus: HashConnectConnectionState) => void;
  handleTransactionEvent: (transaction: MessageTypes.Transaction) => void;
  handleAdditionalAccountRequestEvent: (additionalAccountResponse: MessageTypes.AdditionalAccountRequest) => void;
}

export type { HashConnectEventHandlers };
