import { useEffect, useCallback, Dispatch } from "react";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { ActionType, HashConnectAction } from "./actions/actionsTypes";
import {
  initializeWalletConnection,
  pairWithConnectedWallet,
  pairWithSelectedWalletExtension,
  fetchAccountBalance,
  sendSwapTransactionToWallet,
  sendAddLiquidityTransactionToWallet,
  fetchSpotPrices,
} from "./actions/hashConnectActions";
import { HashConnectState } from "./reducers/hashConnectReducer";
import { useHashConnectEvents } from "./useHashConnectEvents";
import { HASHCONNECT_LOCAL_DATA_KEY } from "./constants";
import { WalletConnectionStatus } from "./types";

const hashconnect = new HashConnect(true);
export interface UseHashConnectProps {
  hashConnectState: HashConnectState;
  dispatch: Dispatch<HashConnectAction>;
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
  const { walletConnectionStatus, installedExtensions } = hashConnectState;
  useHashConnectEvents(hashconnect, hashConnectState, dispatch, debug);

  const saveToLocalStorage = useCallback(() => {
    const hashconnectDataJSON = JSON.stringify(hashConnectState);
    localStorage.setItem(HASHCONNECT_LOCAL_DATA_KEY, hashconnectDataJSON);
  }, [hashConnectState]);

  const clearWalletPairings = useCallback(() => {
    localStorage.removeItem("hashconnectData");
    dispatch({ type: ActionType.CLEAR_WALLET_PAIRINGS, field: "walletData" });
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
    sendAddLiquidityTransaction: (payload: any) =>
      dispatch(sendAddLiquidityTransactionToWallet({ ...payload, hashconnect, hashConnectState, network })),
    clearWalletPairings,
  };
};
export { useHashConnect };
