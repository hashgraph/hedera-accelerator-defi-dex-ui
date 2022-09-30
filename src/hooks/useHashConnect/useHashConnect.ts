import { useEffect, useCallback, Dispatch } from "react";
import { HashConnect, HashConnectTypes } from "hashconnect";
import {
  initializeWalletConnection,
  pairWithConnectedWallet,
  pairWithSelectedWalletExtension,
  fetchAccountBalance,
  sendSwapTransactionToWallet,
  sendAddLiquidityTransactionToWallet,
  fetchSpotPrices,
  getPoolLiquidity,
  clearWalletPairings,
} from "./actions/hashConnectActions";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { useHashConnectEvents } from "./useHashConnectEvents";
import { HASHCONNECT_LOCAL_DATA_KEY } from "./constants";
import { WalletConnectionStatus } from "./types";
import { get100LABTokens } from "../useHederaService/swapContract";
import { DEXActions } from "../../context/HashConnectContext";

const hashconnect = new HashConnect(true);
export interface UseHashConnectProps {
  hashConnectState: HashConnectState;
  /* TODO: Dispatch Type should be updated to match HashConnect action types */
  dispatch: Dispatch<DEXActions>;
  network: string;
  dexMetaData: HashConnectTypes.AppMetadata;
  debug: boolean;
}

export interface UseHashConnectDispatchers {
  sendSwapTransaction: (payload: any) => void;
  sendAddLiquidityTransaction: (payload: any) => void;
  connectToWallet: () => void;
  removeWalletPairings: () => void;
  fetchSpotPrices: () => void;
  getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) => void;
  sendLabTokensToWallet: (payload: any) => void;
}

export const initialHashConnectDispatchers = {
  sendSwapTransaction: () => Promise.resolve(),
  sendAddLiquidityTransaction: () => Promise.resolve(),
  connectToWallet: () => null,
  removeWalletPairings: () => null,
  fetchSpotPrices: () => null,
  getPoolLiquidity: () => null,
  sendLabTokensToWallet: () => Promise.resolve(),
};

const useHashConnect = ({
  hashConnectState,
  dispatch,
  network = "testnet",
  dexMetaData,
  debug,
}: UseHashConnectProps): UseHashConnectDispatchers => {
  const { walletConnectionStatus, installedExtensions } = hashConnectState;
  useHashConnectEvents(hashconnect, dispatch, debug);

  const saveToLocalStorage = useCallback(() => {
    const hashconnectDataJSON = JSON.stringify(hashConnectState);
    localStorage.setItem(HASHCONNECT_LOCAL_DATA_KEY, hashconnectDataJSON);
  }, [hashConnectState]);

  const removeWalletPairings = useCallback(() => {
    localStorage.removeItem("hashconnectData");
    dispatch(clearWalletPairings());
  }, [dispatch]);

  useEffect(() => {
    if (walletConnectionStatus === WalletConnectionStatus.INITIALIZING) {
      dispatch(
        initializeWalletConnection({
          hashconnect,
          network,
          dexMetaData,
          debug,
        })
      );
    } else {
      dispatch(pairWithConnectedWallet({ hashconnect, dexMetaData, hashConnectState }));
    }
    dispatch(fetchSpotPrices());
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToLocalStorage();
  }, [hashConnectState, saveToLocalStorage]);

  useEffect(() => {
    if (walletConnectionStatus === WalletConnectionStatus.PAIRED) {
      dispatch(fetchAccountBalance({ hashconnect, hashConnectState, network }));
    }
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnectionStatus]);

  return {
    connectToWallet: () =>
      dispatch(pairWithSelectedWalletExtension({ hashconnect, hashConnectState, installedExtensions })),
    sendSwapTransaction: (payload: any) =>
      dispatch(sendSwapTransactionToWallet({ ...payload, hashconnect, hashConnectState, network })),
    fetchSpotPrices: () => dispatch(fetchSpotPrices()),
    getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) =>
      dispatch(getPoolLiquidity(tokenToTrade, tokenToReceive)),
    sendAddLiquidityTransaction: (payload: any) =>
      dispatch(sendAddLiquidityTransactionToWallet({ ...payload, hashconnect, hashConnectState, network })),
    removeWalletPairings,
    sendLabTokensToWallet: (receivingAccountId: string) =>
      get100LABTokens(receivingAccountId, hashconnect, hashConnectState, network),
  };
};
export { useHashConnect };
