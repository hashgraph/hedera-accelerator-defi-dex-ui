import { BigNumber } from "bignumber.js";
import { StateCreator } from "zustand";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { AccountBalanceJson, LedgerId } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { DEXState } from "../createDEXStore";

enum WalletActionType {
  INITIALIZE_WALLET_CONNECTION_STARTED = "wallet/INITIALIZE_WALLET_CONNECTION_STARTED",
  INITIALIZE_WALLET_CONNECTION_SUCCEEDED = "wallet/INITIALIZE_WALLET_CONNECTION_SUCCEEDED",
  INITIALIZE_WALLET_CONNECTION_FAILED = "wallet/INITIALIZE_WALLET_CONNECTION_FAILED",
  PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED = "wallet/PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED",
  PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED = "wallet/PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED",
  PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED = "wallet/PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED",
  FETCH_ACCOUNT_BALANCE_STARTED = "wallet/FETCH_ACCOUNT_BALANCE_STARTED",
  FETCH_ACCOUNT_BALANCE_SUCCEEDED = "wallet/FETCH_ACCOUNT_BALANCE_SUCCEEDED",
  FETCH_ACCOUNT_BALANCE_FAILED = "wallet/FETCH_ACCOUNT_BALANCE_FAILED",
  DISCONNECT_WALLET_STARTED = "wallet/DISCONNECT_WALLET_STARTED",
  DISCONNECT_WALLET_SUCCEEDED = "wallet/DISCONNECT_WALLET_SUCCEEDED",
  DISCONNECT_WALLET_FAILED = "wallet/DISCONNECT_WALLET_FAILED",
  ADD_INSTALLED_EXTENSION = "wallet/ADD_INSTALLED_EXTENSION",
  WALLET_PAIRING_APPROVED = "wallet/WALLET_PAIRING_APPROVED",
  RECEIVED_CONNECTION_STATUS_CHANGED = "wallet/RECEIVED_CONNECTION_STATUS_CHANGED",
}

enum WalletConnectionStatus {
  INITIALIZING = "Initializing",
  READY_TO_PAIR = "Ready To Pair",
  PAIRED = "Paired",
}

type ConnectionStatus = "Paired" | "Connected" | "Connecting" | "Disconnected";

type WalletConnectionStatusTypes = keyof typeof WalletConnectionStatus;

interface WalletState {
  hashConnectConnectionState: HashConnectConnectionState;
  savedPairingData: {
    accountIds: string[];
  } | null;
  pairedAccountBalance: AccountBalanceJson | null;
  errorMessage: string | null;
}

interface WalletActions {
  getTokenAmountWithPrecision: (tokenId: string, tokenAmount: number) => BigNumber;
  getSigner: () => HashConnectSigner;
  connectToWallet: () => void;
  disconnectWallet: () => void;
  initializeWalletConnection: () => Promise<void>;
  fetchAccountBalance: () => Promise<void>;
  doesUserHaveGODTokensToVote: () => boolean;
  isPaired: () => boolean;
  handlePairingEvent: (approvePairing: any) => void;
  handleConnectionStatusChangeEvent: (connectionStatus: HashConnectConnectionState) => void;
  setupHashConnectEvents: () => void;
  destroyHashConnectEvents: () => void;
  reconnect: (newNetwork: LedgerId) => void;
}

interface WalletStore extends WalletState, WalletActions {}

type WalletSlice = StateCreator<
  DEXState,
  [["zustand/devtools", never], ["zustand/immer", never]],
  [],
  WalletState & WalletActions
>;

export { WalletActionType, WalletConnectionStatus };
export type { WalletSlice, WalletStore, WalletState, WalletActions, ConnectionStatus, WalletConnectionStatusTypes };
