import React, { Reducer, useContext } from "react";
import useEnhancedReducer from "@rest-hooks/use-enhanced-reducer";
import { HashConnectTypes } from "hashconnect";
import { Networks, WalletConnectionStatus } from "../hooks/useHashConnect/types";
import { DEFAULT_APP_METADATA } from "./constants";
import {
  useHashConnect,
  hashConnectReducer,
  initialHashConnectState,
  initHashConnectReducer,
  HashConnectState,
  thunkMiddleware,
} from "../hooks/useHashConnect";
import { HashConnectAction } from "../hooks/useHashConnect/actions/actionsTypes";
import { loggerMiddleware } from "../middleware";

export interface HashConnectContextProps {
  sendSwapTransaction: (payload: any) => void;
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  fetchSpotPrices: () => void;
  connectionStatus: WalletConnectionStatus;
  walletData: any | null;
  network: Networks;
  spotPrices: Map<string, number | undefined> | undefined;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
}

const HashConnectContext = React.createContext<HashConnectContextProps>({
  sendSwapTransaction: () => Promise.resolve(),
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  fetchSpotPrices: () => null,
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  walletData: null,
  network: "testnet",
  spotPrices: undefined,
  installedExtensions: null,
});

export interface HashConnectProviderProps {
  children?: React.ReactNode;
  dexMetaData?: HashConnectTypes.AppMetadata;
  network?: Networks;
  debug?: boolean;
}
const init = initHashConnectReducer(initialHashConnectState);

const HashConnectProvider = ({
  children,
  dexMetaData = DEFAULT_APP_METADATA,
  network = "testnet",
  debug = false,
}: HashConnectProviderProps): JSX.Element => {
  const [hashConnectState, dispatch] = useEnhancedReducer<Reducer<HashConnectState, HashConnectAction>>(
    hashConnectReducer,
    init,
    [loggerMiddleware, thunkMiddleware]
  );
  const { connectToWallet, clearWalletPairings, sendSwapTransaction, fetchSpotPrices } = useHashConnect({
    hashConnectState,
    dispatch,
    network,
    dexMetaData,
    debug,
  });

  return (
    <HashConnectContext.Provider
      value={{
        sendSwapTransaction,
        connectToWallet,
        clearWalletPairings,
        fetchSpotPrices,
        spotPrices: hashConnectState.spotPrices,
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
