import React, { Reducer, useContext } from "react";
import { HashConnectTypes } from "hashconnect";
import useEnhancedReducer from "@rest-hooks/use-enhanced-reducer";
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
import { HashConnectAction } from "../hooks/useHashConnect/actions/actionsTypes";
import { loggerMiddleware } from "../middleware";
import { MirrorNodeState, initialMirrorNodeState, useMirrorNode } from "../hooks/useMirrorNode";

export interface DEXStore {
  hashConnectState: HashConnectState;
  mirrorNodeState: MirrorNodeState;
}

export type HashConnectContextProps = DEXStore &
  UseHashConnectDispatchers & {
    network: Networks;
  };

export interface HashConnectProviderProps {
  children?: React.ReactNode;
  dexMetaData?: HashConnectTypes.AppMetadata;
  network?: Networks;
  debug?: boolean;
}

const HashConnectContext = React.createContext<HashConnectContextProps>({
  hashConnectState: { ...initHashConnectReducer(initialHashConnectState) },
  mirrorNodeState: { ...initialMirrorNodeState },
  ...initialHashConnectDispatchers,
  network: "testnet",
});

const HashConnectProvider = ({
  children,
  dexMetaData = DEFAULT_APP_METADATA,
  network = "testnet",
  debug = false,
}: HashConnectProviderProps): JSX.Element => {
  const [hashConnectState, dispatch] = useEnhancedReducer<Reducer<HashConnectState, HashConnectAction>>(
    hashConnectReducer,
    initHashConnectReducer(initialHashConnectState),
    [loggerMiddleware, thunkMiddleware]
  );
  const mirrorNodeState = useMirrorNode();

  return (
    <HashConnectContext.Provider
      value={{
        hashConnectState,
        ...useHashConnect({
          hashConnectState,
          dispatch,
          network,
          dexMetaData,
          debug,
        }),
        mirrorNodeState,
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
