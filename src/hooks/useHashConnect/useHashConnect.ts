import { useEffect, useCallback, Dispatch, useState } from "react";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { ActionType, HashConnectActions } from "./reducers/actionsTypes";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { useHashConnectEvents } from "./useHashConnectEvents";
import { HASHCONNECT_LOCAL_DATA_KEY } from "./constants";
import { WalletConnectionStatus } from "./types";

/*
const dexMetadata: HashConnectTypes.AppMetadata = {
  name: "Hedera Open DEX",
  description: "An example hedera DEX",
  icon: "",
};
*/

const hashconnect = new HashConnect(true);

export interface UseHashConnectProps {
  hashConnectState: HashConnectState;
  dispatch: Dispatch<HashConnectActions>;
  network: string;
  dexMetaData: HashConnectTypes.AppMetadata;
  debug: boolean;
}

const useHashConnect = ({
  hashConnectState,
  dispatch,
  network = "testnet",
  dexMetaData,
  debug,
}: UseHashConnectProps) => {
  const { walletConnectionStatus, installedExtensions, walletData } = hashConnectState;
  useHashConnectEvents(hashconnect, hashConnectState, dispatch, debug);

  const initWalletConnection = useCallback(async (): Promise<any> => {
    const initData = await hashconnect.init(dexMetaData);
    const privateKey = initData.privKey;
    const nodeConnectionState = await hashconnect.connect();
    const walletPairingString = hashconnect.generatePairingString(nodeConnectionState, network, debug ?? false);
    hashconnect.findLocalWallets();
    return {
      network,
      privateKey: privateKey,
      topicID: nodeConnectionState.topic,
      walletPairingString,
    };
  }, [dexMetaData, network, debug]);

  const pairWallet = useCallback(
    async (hashconnectData: HashConnectState) => {
      const { walletData } = hashconnectData;
      await hashconnect.init(dexMetaData, walletData.privateKey);
      await hashconnect.connect(walletData.topicID, dexMetaData);
    },
    [dexMetaData]
  );

  const saveToLocalStorage = useCallback(() => {
    const hashconnectDataJSON = JSON.stringify(hashConnectState);
    localStorage.setItem(HASHCONNECT_LOCAL_DATA_KEY, hashconnectDataJSON);
  }, [hashConnectState]);

  const establishWalletConnection = useCallback(async () => {
    if (debug) console.log("==== Establish Connection ====");
    try {
      if (walletConnectionStatus === WalletConnectionStatus.INITIALIZING) {
        const updatedHashconnectData = await initWalletConnection();
        dispatch({ type: ActionType.INIT_WALLET_CONNECTION, field: "walletData", payload: updatedHashconnectData });
      } else {
        await pairWallet(hashConnectState);
      }
    } catch (error) {
      console.error(error);
    }
  }, [debug, dispatch, hashConnectState, walletConnectionStatus, initWalletConnection, pairWallet]);

  const connectToWallet = useCallback(() => {
    const hasInstalledExtensions = installedExtensions?.length > 0;
    if (hasInstalledExtensions) {
      if (walletData?.walletPairingString) {
        const { walletPairingString } = walletData;
        if (debug) console.log("Pairing String::", walletPairingString);
        hashconnect.connectToLocalWallet(walletPairingString);
      } else {
        if (debug) console.log("==== No Extension found in browser ====");
        return "wallet not installed";
      }
    }
  }, [installedExtensions, walletData, debug]);

  const clearWalletPairings = useCallback(() => {
    localStorage.removeItem("hashconnectData");
    dispatch({ type: ActionType.CLEAR_WALLET_PAIRINGS, field: "walletData" });
  }, [dispatch]);

  const getWalletBalance = useCallback(async () => {
    const provider = hashconnect.getProvider(network, walletData.topicID, walletData.pairedAccounts[0]);
    const walletBalance = await provider.getAccountBalance(walletData.pairedAccounts[0]);
    console.log(walletBalance.toJSON());
    const walletBalanceJSON = walletBalance.toJSON();
    dispatch({ type: ActionType.GET_WALLET_BALANCE, field: "walletData", payload: walletBalanceJSON });
  }, [network, walletData.topicID, walletData.pairedAccounts, dispatch]);

  useEffect(() => {
    establishWalletConnection();
  }, []);

  useEffect(() => {
    saveToLocalStorage();
  }, [hashConnectState, saveToLocalStorage]);

  useEffect(() => {
    if (debug) console.log(walletConnectionStatus);
    if (walletConnectionStatus === WalletConnectionStatus.PAIRED) {
      getWalletBalance();
    }
  }, [debug, walletConnectionStatus, getWalletBalance]);

  return {
    connectToWallet,
    clearWalletPairings,
  };
};
export { useHashConnect };
