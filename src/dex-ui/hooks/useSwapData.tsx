import { useCallback, useEffect, useRef } from "react";
import { useDexContext } from ".";

/**
 * Fetches swap data on various events:
 * - On first load and change of wallet account ID.
 * - On a specified interval.
 * - On a completion of a transaction (success or failure).
 * @param refreshInterval - Sets the desired interval (in milliseconds) at
 * which swap data will be refetched and refreshed in the UI. If the refresh
 * interval is set to 0, swap data will not refresh on a timed interval.
 */
export const useSwapData = (refreshInterval = 0) => {
  const isInitialFetch = useRef(true);
  const { wallet, swap } = useDexContext(({ wallet, swap }) => ({
    wallet,
    swap,
  }));
  const walletAccountId = wallet.walletData.pairedAccounts[0];
  const { transactionState, fetchFee, fetchSpotPrices, getPrecision } = swap;

  const fetchSwapDataOnLoad = useCallback(async () => {
    getPrecision();
    await Promise.allSettled([fetchFee(), fetchSpotPrices()]);
  }, [getPrecision, fetchFee, fetchSpotPrices]);

  const fetchSwapDataOnInterval = useCallback(async () => {
    await fetchSpotPrices();
  }, [fetchSpotPrices]);

  const fetchSwapDataOnEvent = useCallback(async () => {
    await Promise.allSettled([wallet.fetchAccountBalance(), fetchSpotPrices()]);
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetches all swap data on first load and change of wallet account ID.
   */
  useEffect(() => {
    fetchSwapDataOnLoad();
  }, [fetchSwapDataOnLoad, walletAccountId]);

  /**
   * Fetches all swap data on a specified interval (milliseconds).
   */
  useEffect(() => {
    const shouldRefresh = refreshInterval > 0;
    if (shouldRefresh) {
      const interval = setInterval(() => {
        fetchSwapDataOnInterval();
      }, refreshInterval);
      return () => {
        clearInterval(interval);
      };
    }
  }, [refreshInterval, fetchSwapDataOnInterval]);

  /**
   * Fetches all swap data on completion of a transaction event (success or failure).
   */
  useEffect(() => {
    if (isInitialFetch.current) {
      isInitialFetch.current = false;
      return;
    }
    fetchSwapDataOnEvent();
  }, [fetchSwapDataOnEvent, transactionState.successPayload, transactionState.errorMessage]);
};
