import { useCallback, useEffect, useRef } from "react";
import { useDexContext } from ".";

/**
 * Fetches pool data on various events:
 * - On first load and change of wallet account ID.
 * - On a specified interval.
 * - On a completion of a transaction (success or failure).
 * @param refreshInterval - Sets the desired interval (in milliseconds) at
 * which pool metric data will be refetched and refreshed in the UI. If the refresh
 * interval is set to 0, pool data will not refresh on a timed interval.
 */
export const usePoolsData = (refreshInterval = 0) => {
  const isInitialFetch = useRef(true);
  const { wallet, pools } = useDexContext(({ app, wallet, pools }) => ({ app, wallet, pools }));
  const walletAccountId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { withdrawTransactionState, fetchAllPoolMetrics, fetchUserPoolMetrics } = pools;

  const fetchPoolDataOnLoad = useCallback(async () => {
    await fetchAllPoolMetrics();
    await fetchUserPoolMetrics(walletAccountId);
  }, [fetchAllPoolMetrics, fetchUserPoolMetrics, walletAccountId]);

  const fetchPoolDataOnInterval = useCallback(async () => {
    await fetchAllPoolMetrics();
    await fetchUserPoolMetrics(walletAccountId);
  }, [fetchAllPoolMetrics, fetchUserPoolMetrics, walletAccountId]);

  const fetchPoolDataOnEvent = useCallback(async () => {
    await fetchAllPoolMetrics();
    await fetchUserPoolMetrics(walletAccountId);
  }, [fetchAllPoolMetrics, fetchUserPoolMetrics, walletAccountId]);

  /**
   * Fetches all pool data on first load and change of wallet account ID.
   */
  useEffect(() => {
    fetchPoolDataOnLoad();
  }, [fetchPoolDataOnLoad, walletAccountId]);

  /**
   * Fetches all pool data on a specified interval (milliseconds).
   */
  useEffect(() => {
    const shouldRefresh = refreshInterval > 0;
    if (shouldRefresh) {
      const interval = setInterval(() => {
        fetchPoolDataOnInterval();
      }, refreshInterval);
      return () => {
        clearInterval(interval);
      };
    }
  }, [refreshInterval, fetchPoolDataOnInterval]);

  /**
   * Fetches all pool data on completion of a transaction event (success or failure).
   */
  useEffect(() => {
    if (isInitialFetch.current) {
      isInitialFetch.current = false;
      return;
    }
    fetchPoolDataOnEvent();
  }, [fetchPoolDataOnEvent, withdrawTransactionState.successPayload, withdrawTransactionState.errorMessage]);
};
