import { HashConnectTypes, MessageTypes } from "hashconnect";
import { ConnectionStatus } from "../../store/walletSlice";

interface HashConnectEventHandlers {
  handleFoundExtensionEvent: (walletMetadata: HashConnectTypes.WalletMetadata) => void;
  handlePairingEvent: (approvePairing: MessageTypes.ApprovePairing) => void;
  handleAcknowledgeMessageEvent: (acknowledgeData: MessageTypes.Acknowledge) => void;
  handleConnectionStatusChange: (connectionStatus: ConnectionStatus) => void;
  handleTransactionEvent: (transaction: MessageTypes.Transaction) => void;
  handleAdditionalAccountRequestEvent: (additionalAccountResponse: MessageTypes.AdditionalAccountRequest) => void;
}

export type { HashConnectEventHandlers };
