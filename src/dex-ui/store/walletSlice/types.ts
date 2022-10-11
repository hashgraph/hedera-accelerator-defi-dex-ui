import { HashConnectTypes, MessageTypes } from "hashconnect";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { DEXState } from "../createDEXStore";
import { StateCreator } from "zustand";

enum WalletActionType {
  INITIALIZE_WALLET_CONNECTION_STARTED = "wallet/INITIALIZE_WALLET_CONNECTION_STARTED",
  INITIALIZE_WALLET_CONNECTION_SUCCEEDED = "wallet/INITIALIZE_WALLET_CONNECTION_SUCCEEDED",
  INITIALIZE_WALLET_CONNECTION_FAILED = "wallet/INITIALIZE_WALLET_CONNECTION_FAILED",
  PAIR_WITH_CONNECTED_WALLET_STARTED = "wallet/PAIR_WITH_CONNECTED_WALLET_STARTED",
  PAIR_WITH_CONNECTED_WALLET_SUCCEEDED = "wallet/PAIR_WITH_CONNECTED_WALLET_SUCCEEDED",
  PAIR_WITH_CONNECTED_WALLET_FAILED = "wallet/PAIR_WITH_CONNECTED_WALLET_FAILED",
  PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED = "wallet/PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED",
  PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED = "wallet/PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED",
  PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED = "wallet/PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED",
  FETCH_ACCOUNT_BALANCE_STARTED = "wallet/FETCH_ACCOUNT_BALANCE_STARTED",
  FETCH_ACCOUNT_BALANCE_SUCCEEDED = "wallet/FETCH_ACCOUNT_BALANCE_SUCCEEDED",
  FETCH_ACCOUNT_BALANCE_FAILED = "wallet/FETCH_ACCOUNT_BALANCE_FAILED",
  CLEAR_WALLET_PAIRINGS = "wallet/CLEAR_WALLET_PAIRINGS",
  ADD_INSTALLED_EXTENSION = "wallet/ADD_INSTALLED_EXTENSION",
  WALLET_PAIRING_APPROVED = "wallet/WALLET_PAIRING_APPROVED",
  RECEIVED_CONNECTION_STATUS_CHANGED = "wallet/RECEIVED_CONNECTION_STATUS_CHANGED",
  LOCAL_CONNECTION_STATUS_CHANGED = "wallet/LOCAL_CONNECTION_STATUS_CHANGED",
}

enum WalletConnectionStatus {
  INITIALIZING = "Initializing",
  READY_TO_PAIR = "Ready To Pair",
  PAIRED = "Paired",
}

type Networks = "testnet" | "mainnet" | "previewnet";

type ConnectionStatus = "Paired" | "Connected" | "Connecting" | "Disconnected";

type WalletConnectionStatusTypes = keyof typeof WalletConnectionStatus;

interface WalletState {
  installedExtensions: HashConnectTypes.WalletMetadata[];
  walletData: {
    id: string | null;
    network: string;
    topicID: string;
    walletPairingString: string;
    privateKey: string;
    pairedWalletData: HashConnectTypes.WalletMetadata | null;
    pairedAccountBalance: AccountBalanceJson | null;
    pairedAccounts: string[];
  };
  walletConnectionStatus: WalletConnectionStatus;
  errorMessage: string | null;
}

interface WalletActions {
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  saveWalletDataToLocalStorage: (walletData: any) => void;
  initializeWalletConnection: () => Promise<void>;
  pairWithConnectedWallet: () => Promise<void>;
  fetchAccountBalance: () => Promise<void>;
  handleFoundExtensionEvent: (walletMetadata: HashConnectTypes.WalletMetadata) => void;
  handlePairingEvent: (approvePairing: MessageTypes.ApprovePairing) => void;
  handleAcknowledgeMessageEvent: (acknowledgeData: MessageTypes.Acknowledge) => void;
  handleConnectionStatusChange: (connectionStatus: ConnectionStatus) => void;
  handleTransactionEvent: (transaction: MessageTypes.Transaction) => void;
  handleAdditionalAccountRequestEvent: (additionalAccountResponse: MessageTypes.AdditionalAccountRequest) => void;
  setupHashConnectEvents: () => void;
  destroyHashConnectEvents: () => void;
}

interface WalletStore extends WalletState, WalletActions {}

type WalletSlice = StateCreator<
  DEXState,
  [["zustand/devtools", never], ["zustand/immer", never]],
  [],
  WalletState & WalletActions
>;

export { WalletActionType, WalletConnectionStatus };
export type {
  WalletSlice,
  WalletStore,
  WalletState,
  WalletActions,
  Networks,
  ConnectionStatus,
  WalletConnectionStatusTypes,
};
