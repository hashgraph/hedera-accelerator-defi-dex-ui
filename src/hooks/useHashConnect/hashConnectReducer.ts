import { HashConnectTypes } from "hashconnect";
import { ActionType, HashConnectActions } from "./actionsTypes";
import { getLocalHashconnectData } from "./utils";
import { WalletConnectionStatus } from "./types";

export interface HashConnectState {
  walletConnectionStatus: WalletConnectionStatus;
  installedExtensions: HashConnectTypes.WalletMetadata[];
  walletData: {
    id: string | null;
    network: string;
    topicID: string;
    walletPairingString: string;
    privateKey: string;
    pairedWalletData: HashConnectTypes.WalletMetadata | null;
    pairedAccounts: string[];
  };
}

const initialHashConnectState: HashConnectState = {
  walletConnectionStatus: WalletConnectionStatus.INITIALIZING,
  installedExtensions: [],
  walletData: {
    id: null,
    network: "",
    topicID: "",
    walletPairingString: "",
    privateKey: "",
    pairedWalletData: null,
    pairedAccounts: [],
  },
};

function initHashConnectReducer(initialHashConnectState: HashConnectState) {
  return getLocalHashconnectData() ?? initialHashConnectState;
}

function hashConnectReducer(state: HashConnectState, action: HashConnectActions): HashConnectState {
  switch (action.type) {
    case ActionType.INIT_WALLET_CONNECTION: {
      const { field, payload } = action;
      const walletData = payload;
      return {
        ...state,
        walletConnectionStatus: WalletConnectionStatus.CONNECTED,
        [field]: {
          ...state[field],
          ...walletData,
        },
      };
    }
    case ActionType.CLEAR_WALLET_PAIRINGS: {
      const { field } = action;
      return {
        ...state,
        walletConnectionStatus: WalletConnectionStatus.CONNECTED,
        [field]: {
          ...state[field],
          pairedWalletData: null,
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
    case ActionType.CONNECTION_STATUS_CHANGED: {
      return state;
    }
    default:
      throw new Error();
  }
}

export { hashConnectReducer, initHashConnectReducer, initialHashConnectState };
