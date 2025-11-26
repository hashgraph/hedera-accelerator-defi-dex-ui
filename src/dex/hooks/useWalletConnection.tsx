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
    console.log("(useWalletConnection) Setting up wallet connection...");
    setupHashConnectEvents();
    await initializeWalletConnection();
    console.log("(useWalletConnection) Wallet initialized, connection state:", wallet.hashConnectConnectionState);
    console.log("(useWalletConnection) Saved pairing data:", wallet.savedPairingData);

    // If already paired (auto-reconnected from localStorage), fetch balance
    if (wallet.savedPairingData?.accountIds?.length) {
      console.log("(useWalletConnection) Auto-reconnected, fetching balance...");
      fetchAccountBalance();
    }
  }, [setupHashConnectEvents, initializeWalletConnection, fetchAccountBalance]);
  // Removed wallet.hashConnectConnectionState and wallet.savedPairingData from deps
  // These change frequently and cause re-initialization loops

  useEffect(() => {
    onLoad();
    return () => {
      destroyHashConnectEvents();
    };
  }, [onLoad, destroyHashConnectEvents]);

  useEffect(() => {
    console.log("(useWalletConnection) Connection state changed:", wallet.hashConnectConnectionState);
    if (wallet.hashConnectConnectionState === HashConnectConnectionState.Paired) {
      console.log("(useWalletConnection) Paired! Fetching balance...");
      fetchAccountBalance();
    }
  }, [wallet.hashConnectConnectionState, fetchAccountBalance]);
}
