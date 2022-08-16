import { MessageTypes } from "hashconnect";
import { ActionType, HashConnectAction } from "./actionsTypes";
import { WalletConnectionStatus } from "../types";
import { getErrorMessage } from "../utils";

const initializeWalletConnectionStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.INITIALIZE_WALLET_CONNECTION_STARTED,
  };
};

const initializeWalletConnectionSucceeded = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.INITIALIZE_WALLET_CONNECTION_SUCCEEDED,
    field: "walletData",
    payload,
  };
};

const initializeWalletConnectionFailed = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.INITIALIZE_WALLET_CONNECTION_FAILED,
    payload,
  };
};

const pairWithConnectedWalletStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_CONNECTED_WALLET_STARTED,
  };
};

const pairWithConnectedWalletSucceeded = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_CONNECTED_WALLET_SUCCEEDED,
  };
};

const pairWithConnectedWalletFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_CONNECTED_WALLET_FAILED,
    payload,
  };
};

const pairWithSelectedWalletExtensionStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_STARTED,
  };
};

const pairWithSelectedWalletExtensionSucceeded = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_SUCCEEDED,
  };
};

const pairWithSelectedWalletExtensionFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.PAIR_WITH_SELECTED_WALLET_EXTENSION_FAILED,
    payload,
  };
};

const fetchAccountBalanceStarted = (payload?: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_ACCOUNT_BALANCE_STARTED,
  };
};

const fetchAccountBalanceSucceeded = (payload: any): HashConnectAction => {
  return {
    type: ActionType.FETCH_ACCOUNT_BALANCE_SUCCEEDED,
    field: "walletData",
    payload,
  };
};

const fetchAccountBalanceFailed = (payload: string): HashConnectAction => {
  return {
    type: ActionType.FETCH_ACCOUNT_BALANCE_FAILED,
    payload,
  };
};

const initializeWalletConnection = (payload: any) => {
  return async (dispatch: any) => {
    dispatch(initializeWalletConnectionStarted());
    try {
      const { hashconnect, dexMetaData, network, debug } = payload;
      const initData = await hashconnect.init(dexMetaData);
      const privateKey = initData.privKey;
      const nodeConnectionState = await hashconnect.connect();
      const walletPairingString = hashconnect.generatePairingString(nodeConnectionState, network, debug ?? false);
      hashconnect.findLocalWallets();
      const updatedHashconnectData = {
        network,
        privateKey: privateKey,
        topicID: nodeConnectionState.topic,
        walletPairingString,
      };
      dispatch(initializeWalletConnectionSucceeded(updatedHashconnectData));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(initializeWalletConnectionFailed(errorMessage));
    }
  };
};

const pairWithConnectedWallet = (payload: any) => {
  return async (dispatch: any) => {
    dispatch(pairWithConnectedWalletStarted());
    const { hashconnect, dexMetaData, hashConnectState } = payload;
    const { walletData } = hashConnectState;
    try {
      await hashconnect.init(dexMetaData, walletData.privateKey);
      await hashconnect.connect(walletData.topicID, dexMetaData);
      dispatch(pairWithConnectedWalletSucceeded());
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(pairWithConnectedWalletFailed(errorMessage));
    }
  };
};

/**
 *
 * @param payload
 * @returns Async Action Creator
 */
const pairWithSelectedWalletExtension = (payload: any) => {
  return (dispatch: any) => {
    dispatch(pairWithSelectedWalletExtensionStarted());
    const { hashconnect, installedExtensions, hashConnectState } = payload;
    const { walletData } = hashConnectState;
    const hasInstalledExtensions = installedExtensions?.length > 0;
    if (hasInstalledExtensions) {
      if (walletData?.walletPairingString) {
        const { walletPairingString } = walletData;
        hashconnect.connectToLocalWallet(walletPairingString);
        dispatch(pairWithSelectedWalletExtensionSucceeded());
      } else {
        const errorMessage = "Selected wallet not installed.";
        dispatch(pairWithSelectedWalletExtensionFailed(errorMessage));
      }
    }
  };
};

const fetchAccountBalance = (payload: any) => {
  return async (dispatch: any) => {
    dispatch(fetchAccountBalanceStarted());
    try {
      const { hashconnect, hashConnectState, network } = payload;
      const { walletData } = hashConnectState;
      const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
      const walletBalance = await provider.getAccountBalance(walletData.pairedAccounts[0]);
      const walletBalanceJSON = walletBalance.toJSON();
      dispatch(fetchAccountBalanceSucceeded(walletBalanceJSON));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(fetchAccountBalanceFailed(errorMessage));
    }
  };
};

export { initializeWalletConnection, pairWithConnectedWallet, pairWithSelectedWalletExtension, fetchAccountBalance };
