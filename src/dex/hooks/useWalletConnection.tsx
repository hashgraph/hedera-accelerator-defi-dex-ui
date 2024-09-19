import { HashConnectConnectionState } from "hashconnect/dist/types";
import { useCallback, useEffect } from "react";
import { useDexContext } from ".";

/**
 * Used to setup and manage connections with local Hedera enabled wallets.
 */
export function useWalletConnection() {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const { fetchAccountBalance, setupHashConnectEvents, initializeWalletConnection, destroyHashConnectEvents } = wallet;

  const onLoad = useCallback(async () => {
    setupHashConnectEvents();
    await initializeWalletConnection();
    fetchAccountBalance();
  }, [setupHashConnectEvents, initializeWalletConnection, fetchAccountBalance]);

  useEffect(() => {
    onLoad();
    return () => {
      destroyHashConnectEvents();
    };
  }, [onLoad, destroyHashConnectEvents]);

  useEffect(() => {
    if (wallet.hashConnectConnectionState === HashConnectConnectionState.Paired) {
      fetchAccountBalance();
    }
  }, [wallet.hashConnectConnectionState, fetchAccountBalance]);
}
