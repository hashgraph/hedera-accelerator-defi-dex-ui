import React, { useReducer, useContext } from "react";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { Networks, WalletConnectionStatus } from "../hooks/useHashConnect/types";
import { DEFAULT_APP_METADATA } from "./constants";
import {
  useHashConnect,
  hashConnectReducer,
  initialHashConnectState,
  initHashConnectReducer,
} from "../hooks/useHashConnect";
import { BladeSigner } from "@bladelabs/blade-web3.js";

export interface HashConnectContextProps {
  sendSwapTransaction: (
    depositTokenAccountId: string,
    depositTokenAmount: number,
    receivingTokenAccountId: string,
    receivingTokenAmount: number
  ) => Promise<void>;
  connectToWallet: () => void;
  clearWalletPairings: () => void;
  connectionStatus: WalletConnectionStatus;
  walletData: any | null;
  network: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata[] | null;
  connectToBlade: () => void;
  bladeWallet: BladeSigner | null;
  selectedWalletName: 'HashPack' | 'Blade' | null;
}

const HashConnectContext = React.createContext<HashConnectContextProps>({
  sendSwapTransaction: () => Promise.resolve(),
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  walletData: null,
  network: "testnet",
  installedExtensions: null,
  connectToBlade: () => null,
  bladeWallet: null,
  selectedWalletName: null,
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
  const { connectToWallet, clearWalletPairings, sendSwapTransaction, connectToBlade } = useHashConnect({
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
        connectionStatus: hashConnectState.walletConnectionStatus,
        walletData: hashConnectState.walletData,
        network,
        installedExtensions: hashConnectState.installedExtensions,
        connectToBlade,
        selectedWalletName: hashConnectState.selectedWalletName,
        bladeWallet: hashConnectState.bladeWallet,
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
