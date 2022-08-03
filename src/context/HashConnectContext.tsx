import React, { useReducer, useContext } from "react";
import { HashConnectTypes } from "hashconnect";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { Networks, WalletConnectionStatus } from "../hooks/useHashConnect/types";
import { DEFAULT_APP_METADATA } from "./constants";
import {
  useHashConnect,
  hashConnectReducer,
  initialHashConnectState,
  initHashConnectReducer,
} from "../hooks/useHashConnect";

export interface HashConnectContextProps {
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  connectionStatus: WalletConnectionStatus;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const HashConnectContext = React.createContext<HashConnectContextProps>({
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  walletData: null,
  network: "testnet",
  installedExtensions: null,
});

export interface HashConnectProviderProps {
  children?: React.ReactNode;
  dexMetaData?: HashConnectTypes.AppMetadata;
  network?: Networks;
  debug?: boolean;
}

const HashConnectProvider = ({
  children,
  dexMetaData = DEFAULT_APP_METADATA,
  network = "testnet",
  debug = false,
}: HashConnectProviderProps): JSX.Element => {
  const [hashConnectState, dispatch] = useReducer(hashConnectReducer, initialHashConnectState, initHashConnectReducer);
  const { connectToWallet, clearWalletPairings } = useHashConnect({
    hashConnectState,
    dispatch,
    network,
    dexMetaData,
    debug,
  });

  return (
    <HashConnectContext.Provider
      value={{
        connectToWallet,
        clearWalletPairings,
        connectionStatus: hashConnectState.walletConnectionStatus,
        walletData: hashConnectState.walletData,
        network,
        installedExtensions: hashConnectState.installedExtensions,
      }}
    >
      {children}
    </HashConnectContext.Provider>
  );
};

const useHashConnectContext = (): HashConnectContextProps => {
  return useContext(HashConnectContext);
};

export { HashConnectProvider, useHashConnectContext, HashConnectContext };
