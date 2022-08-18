import { AccountBalanceJson } from "@hashgraph/sdk";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { ActionType, HashConnectActions } from "./actionsTypes";
import { getLocalHashconnectData } from "../utils";
import { WalletConnectionStatus } from "../types";
import { BladeSigner } from "@bladelabs/blade-web3.js";

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
    pairedAccountBalance: AccountBalanceJson | null;
    pairedAccounts: string[];
  };
  selectedWalletName: 'HashPack' | 'Blade' | null;
  bladeWallet: BladeSigner | null;
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
    pairedAccountBalance: null,
    pairedAccounts: [],
  },
  selectedWalletName: null,
  bladeWallet: null,
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
        walletConnectionStatus: WalletConnectionStatus.READY_TO_PAIR,
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
        selectedWalletName: 'HashPack',
      };
    }
    case ActionType.BLADE_WALLET_CONNECTED: {
      const { bladeWallet } = action;
      return {
        ...state,
        bladeWallet,
        selectedWalletName: 'Blade',
      }
    }
    case ActionType.CONNECTION_STATUS_CHANGED: {
      return state;
    }
    case ActionType.GET_WALLET_BALANCE: {
      const { field, payload } = action;
      return {
        ...state,
        [field]: {
          ...state[field],
          pairedAccountBalance: payload,
        },
      };
    }
    default:
      throw new Error();
  }
}

export { hashConnectReducer, initHashConnectReducer, initialHashConnectState };
