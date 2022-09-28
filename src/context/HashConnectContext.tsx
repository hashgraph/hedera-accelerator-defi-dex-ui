import React, { Reducer, useContext } from "react";
import { HashConnectTypes } from "hashconnect";
import useEnhancedReducer, { Middleware } from "@rest-hooks/use-enhanced-reducer";
import combineReducers from "react-combine-reducers";

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
import {
  useMirrorNode,
  mirrorNodeReducer,
  initialMirrorNodeState,
  MirrorNodeState,
  MirrorNodeAction,
} from "../hooks/useMirrorNode";
import { HashConnectAction } from "../hooks/useHashConnect/actions/actionsTypes";
import { loggerMiddleware } from "../middleware";
import produce from "immer";

export interface Store {
  hashConnect: HashConnectState;
  mirrorNode: MirrorNodeState;
}

export interface HashConnectContextProps {
  hashConnect: HashConnectState;
  mirrorNode: MirrorNodeState;
  sendSwapTransaction: (payload: any) => void;
  sendAddLiquidityTransaction: (payload: any) => void;
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  fetchSpotPrices: () => void;
  getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) => void;
  connectionStatus: WalletConnectionStatus;
  walletData: any | null;
  network: Networks;
  spotPrices: Map<string, number | undefined> | undefined;
  poolLiquidity: Map<string, number | undefined> | undefined;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
  sendLabTokensToWallet: (payload: any) => void;
}

const HashConnectContext = React.createContext<HashConnectContextProps>({
  sendSwapTransaction: () => Promise.resolve(),
  sendAddLiquidityTransaction: () => Promise.resolve(),
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  fetchSpotPrices: () => null,
  getPoolLiquidity: () => null,
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  walletData: null,
  network: "testnet",
  spotPrices: undefined,
  poolLiquidity: undefined,
  installedExtensions: null,
  sendLabTokensToWallet: () => Promise.resolve(),
});

export interface HashConnectProviderProps {
  children?: React.ReactNode;
  dexMetaData?: HashConnectTypes.AppMetadata;
  network?: Networks;
  debug?: boolean;
}

export type Actions = HashConnectAction & MirrorNodeAction;

export type RootReducer = (state: Store, action: Actions) => Store;

/*
 * Wraps reducers with Immer produce for immutable updates.
 * The HashConnect reducer has not yet been updated to immutabley change draft state with the immer pattern.
 */
const [rootReducer, initialStore] = combineReducers<RootReducer>({
  hashConnect: [hashConnectReducer, initHashConnectReducer(initialHashConnectState)],
  mirrorNode: [produce(mirrorNodeReducer), initialMirrorNodeState],
});

const HashConnectProvider = ({
  children,
  dexMetaData = DEFAULT_APP_METADATA,
  network = "testnet",
  debug = false,
}: HashConnectProviderProps): JSX.Element => {
  const [store, dispatch] = useEnhancedReducer<RootReducer>(rootReducer, initialStore, [
    loggerMiddleware,
    thunkMiddleware,
  ]);

  const hashConnectFunctions = useHashConnect({
    hashConnectState,
    dispatch,
    network,
    dexMetaData,
    debug,
  });

  const mirrorNodeFunctions = useMirrorNode({ dispatch, network });

  return (
    <HashConnectContext.Provider
      value={{
        ...store,
        ...hashConnectFunctions,
        ...mirrorNodeFunctions,

        spotPrices: store.hashConnectState.spotPrices,
        getPoolLiquidity,
        poolLiquidity: hashConnectState.poolLiquidity,
        connectionStatus: hashConnectState.walletConnectionStatus,
        walletData: hashConnectState.walletData,
        network,
        installedExtensions: hashConnectState.installedExtensions,
        sendLabTokensToWallet,
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
