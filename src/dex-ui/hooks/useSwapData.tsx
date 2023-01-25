import { useEffect, useRef } from "react";
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
export const useSwapData = (selectedRoute: any, refreshInterval = 0) => {
  const isInitialFetch = useRef(true);
  const { wallet, swap } = useDexContext(({ wallet, swap }) => ({
    wallet,
    swap,
  }));
  const walletAccountId = wallet.savedPairingData?.accountIds[0];
  const { transactionState, fetchFee, fetchSpotPrices, getPrecision, fetchTokenPairs } = swap;

  /**
   * Fetches all swap data on first load and change of wallet account ID.
   */
  useEffect(() => {
    async function fetchSwapDataOnLoad() {
      await Promise.allSettled([
        fetchFee(selectedRoute.selectedPairId),
        fetchSpotPrices(selectedRoute.selectedPairId, selectedRoute.selectedAToBRoute, selectedRoute.selectedBToARoute),
        fetchTokenPairs(),
        getPrecision(selectedRoute.selectedPairId),
      ]);
    }
    fetchSwapDataOnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAccountId]);

  /**
   * Fetches all swap data on a specified interval (milliseconds).
   */
  useEffect(() => {
    async function fetchSwapDataOnInterval() {
      await fetchSpotPrices(
        selectedRoute.selectedPairId,
        selectedRoute.selectedAToBRoute,
        selectedRoute.selectedBToARoute
      );
    }
    const shouldRefresh = refreshInterval > 0;
    if (shouldRefresh) {
      const interval = setInterval(() => {
        fetchSwapDataOnInterval();
      }, refreshInterval);
      return () => {
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  /**
   * Fetches all swap data on completion of a transaction event (success or failure).
   */
  useEffect(() => {
    if (isInitialFetch.current) {
      isInitialFetch.current = false;
      return;
    }
    /** need to fetch spot fee and fee on change of pairs */
    async function fetchSwapDataOnEvent() {
      await Promise.allSettled([
        wallet.fetchAccountBalance(),
        fetchFee(selectedRoute.selectedPairId),
        fetchSpotPrices(selectedRoute.selectedPairId, selectedRoute.selectedAToBRoute, selectedRoute.selectedBToARoute),
        getPrecision(selectedRoute.selectedPairId),
      ]);
    }
    fetchSwapDataOnEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute.selectedPairId, transactionState.successPayload, transactionState.errorMessage]);
};
