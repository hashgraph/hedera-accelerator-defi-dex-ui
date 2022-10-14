import { useEffect } from "react";
import { useDexContext } from ".";
import { WalletConnectionStatus } from "../store/walletSlice";

export function useWalletConnection() {
  const [wallet, swap] = useDexContext(({ wallet, swap }) => [wallet, swap]);
  const { walletConnectionStatus, installedExtensions, walletData } = wallet;

  useEffect(() => {
    swap.getPrecision();
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
      wallet.fetchAccountBalance();
    }
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnectionStatus]);
}
