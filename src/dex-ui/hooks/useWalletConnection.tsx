import { useCallback, useEffect } from "react";
import { useDexContext } from ".";
import { WalletConnectionStatus } from "../store/walletSlice";

/**
 * Used to setup and manage connections with local Hedera enabled wallets.
 */
export function useWalletConnection() {
  const [wallet] = useDexContext(({ wallet }) => [wallet]);
  const { walletConnectionStatus, installedExtensions, walletData, fetchAccountBalance } = wallet;

  const fetchWalletDataOnLoad = useCallback(async () => {
    await fetchAccountBalance();
  }, [fetchAccountBalance]);

  useEffect(() => {
    wallet.setupHashConnectEvents();
    return () => {
      wallet.destroyHashConnectEvents();
    };
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    wallet.saveWalletDataToLocalStorage({ walletConnectionStatus, installedExtensions, walletData });
  }, [wallet, walletConnectionStatus, installedExtensions, walletData]);

  useEffect(() => {
    if (walletConnectionStatus === WalletConnectionStatus.INITIALIZING) {
      wallet.initializeWalletConnection();
    } else {
      wallet.pairWithConnectedWallet();
    }
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (walletConnectionStatus === WalletConnectionStatus.PAIRED) {
      fetchWalletDataOnLoad();
    }
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnectionStatus]);
}
