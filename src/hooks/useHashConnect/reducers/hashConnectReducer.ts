import { AccountBalanceJson } from "@hashgraph/sdk";
import { HashConnectTypes } from "hashconnect";
import { ActionType, HashConnectAction } from "../actions/actionsTypes";
import { getLocalHashconnectData } from "../utils";
import { WalletConnectionStatus } from "../types";

export interface HashConnectState {
  errorMessage: string | null;
  spotPrices: Map<string, number | undefined> | undefined;
  walletConnectionStatus: WalletConnectionStatus;
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
}

const initialHashConnectState: HashConnectState = {
  errorMessage: null,
  spotPrices: undefined,
  walletConnectionStatus: WalletConnectionStatus.INITIALIZING,
  installedExtensions: [],
  walletData: {
    id: null,
    network: "",
    topicID: "",
    walletPairingString: "",
    privateKey: "",
    pairedWalletData: null,
    pairedAccountBalance: null,
    pairedAccounts: [],
  },
};

function initHashConnectReducer(initialHashConnectState: HashConnectState) {
  return getLocalHashconnectData() ?? initialHashConnectState;
}

function hashConnectReducer(state: HashConnectState, action: HashConnectAction): HashConnectState {
  if (typeof action === "function") {
    return state;
  }
  switch (action.type) {
    case ActionType.INITIALIZE_WALLET_CONNECTION_STARTED: {
      return {
        ...state,
        walletConnectionStatus: WalletConnectionStatus.INITIALIZING,
      };
    }
    case ActionType.INITIALIZE_WALLET_CONNECTION_SUCCEEDED: {
      const { field, payload } = action;
      const walletData = payload;
      return {
        ...state,
        walletConnectionStatus: WalletConnectionStatus.READY_TO_PAIR,
        [field]: {
          ...state[field],
          ...walletData,
        },
      };
    }
    case ActionType.INITIALIZE_WALLET_CONNECTION_FAILED: {
      const { payload } = action;
      return {
        ...state,
        errorMessage: payload,
      };
    }
    case ActionType.PAIR_WITH_CONNECTED_WALLET_STARTED: {
      return state;
    }
    case ActionType.PAIR_WITH_CONNECTED_WALLET_SUCCEEDED: {
      return state;
    }
    case ActionType.PAIR_WITH_CONNECTED_WALLET_FAILED: {
      const { payload } = action;
      return {
        ...state,
        errorMessage: payload,
      };
    }
    case ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED: {
      return state;
    }
    case ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED: {
      return state;
    }
    case ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED: {
      const { payload } = action;
      return {
        ...state,
        errorMessage: payload,
      };
    }
    case ActionType.FETCH_ACCOUNT_BALANCE_STARTED: {
      return state;
    }
    case ActionType.FETCH_ACCOUNT_BALANCE_SUCCEEDED: {
      const { field, payload } = action;
      return {
        ...state,
        [field]: {
          ...state[field],
          pairedAccountBalance: payload,
        },
      };
    }
    case ActionType.FETCH_ACCOUNT_BALANCE_FAILED: {
      const { payload } = action;
      return {
        ...state,
        errorMessage: payload,
      };
    }
    case ActionType.FETCH_SPOT_PRICES_STARTED: {
      return state;
    }
    case ActionType.FETCH_SPOT_PRICES_SUCCEEDED: {
      const { payload } = action;
      return {
        ...state,
        spotPrices: payload,
      };
    }
    case ActionType.FETCH_SPOT_PRICES_FAILED: {
      const { payload } = action;
      return {
        ...state,
        errorMessage: payload,
      };
    }
    case ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED: {
      return state;
    }
    case ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED: {
      return state;
    }
    case ActionType.SEND_SWAP_TRANSACTION_TO_WALLET_FAILED: {
      const { payload } = action;
      return {
        ...state,
        errorMessage: payload,
      };
    }
    case ActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED: {
      return state;
    }
    case ActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED: {
      return state;
    }
    case ActionType.SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED: {
      const { errorMessage } = action;
      return {
        ...state,
        errorMessage,
      }
    }
    case ActionType.CLEAR_WALLET_PAIRINGS: {
      const { field } = action;
      return {
        ...state,
        walletConnectionStatus: WalletConnectionStatus.READY_TO_PAIR,
        [field]: {
          ...state[field],
          pairedWalletData: null,
          pairedAccountBalance: null,
          pairedAccounts: [],
        },
      };
    }
    case ActionType.ADD_INSTALLED_EXTENSION: {
      const { installedExtensions } = state;
      return { ...state, installedExtensions: [...installedExtensions, action.payload] };
    }
    case ActionType.WALLET_PAIRING_APPROVED: {
      const { walletData } = state;
      const { field, payload } = action;
      const approvePairing = payload;
      const { metadata, accountIds, topic, id, network } = approvePairing;
      const pairedAccounts = accountIds.filter(
        (accountId: string) => walletData?.pairedAccounts?.indexOf(accountId) === -1
      );
      return {
        ...state,
        walletConnectionStatus: WalletConnectionStatus.PAIRED,
        [field]: {
          ...state[field],
          id: id ? id : null,
          network,
          topicID: topic,
          pairedWalletData: metadata,
          pairedAccounts,
        },
      };
    }
    case ActionType.RECEIVED_CONNECTION_STATUS_CHANGED: {
      return state;
    }
    case ActionType.LOCAL_CONNECTION_STATUS_CHANGED: {
      return state;
    }
    default:
      throw new Error();
  }
}

export { hashConnectReducer, initHashConnectReducer, initialHashConnectState };
