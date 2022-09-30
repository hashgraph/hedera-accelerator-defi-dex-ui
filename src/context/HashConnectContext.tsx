import React, { useContext } from "react";
import { HashConnectTypes } from "hashconnect";
import useEnhancedReducer from "@rest-hooks/use-enhanced-reducer";
import combineReducers from "react-combine-reducers";

import { Networks } from "../hooks/useHashConnect/types";
import { DEFAULT_APP_METADATA } from "./constants";
import {
  useHashConnect,
  hashConnectReducer,
  initialHashConnectState,
  initHashConnectReducer,
  HashConnectState,
  thunkMiddleware,
  UseHashConnectDispatchers,
  initialHashConnectDispatchers,
} from "../hooks/useHashConnect";
import {
  useMirrorNode,
  mirrorNodeReducer,
  initialMirrorNodeState,
  MirrorNodeState,
  MirrorNodeAction,
  UseMirrorNodeDispatchers,
  initialMirrorNodeDispatchers,
} from "../hooks/useMirrorNode";
import { HashConnectAction } from "../hooks/useHashConnect/actions/actionsTypes";
import { loggerMiddleware } from "../middleware";
import produce from "immer";

export interface DEXStore {
  hashConnectState: HashConnectState;
  mirrorNodeState: MirrorNodeState;
}

export type HashConnectContextProps = DEXStore &
  UseHashConnectDispatchers &
  UseMirrorNodeDispatchers & {
    network: Networks;
  };

export interface HashConnectProviderProps {
  children?: React.ReactNode;
  dexMetaData?: HashConnectTypes.AppMetadata;
  network?: Networks;
  debug?: boolean;
}

export type DEXActions = HashConnectAction | MirrorNodeAction;

export type RootReducer = (state: DEXStore, action: DEXActions) => DEXStore;

/*
 * Wraps reducers with Immer produce for immutable updates.
 * The HashConnect reducer has not yet been updated to immutabley change draft state with the immer pattern.
 */
const [rootReducer, initialStore] = combineReducers<RootReducer>({
  hashConnectState: [hashConnectReducer, initHashConnectReducer(initialHashConnectState)],
  mirrorNodeState: [produce(mirrorNodeReducer), initialMirrorNodeState],
});

const HashConnectContext = React.createContext<HashConnectContextProps>({
  ...initialStore,
  ...initialMirrorNodeDispatchers,
  ...initialHashConnectDispatchers,
  network: "testnet",
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

  return (
    <HashConnectContext.Provider
      value={{
        ...store,
        ...useHashConnect({
          hashConnectState: store.hashConnectState,
          dispatch,
          network,
          dexMetaData,
          debug,
        }),
        ...useMirrorNode({ dispatch, network }),
        network,
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
