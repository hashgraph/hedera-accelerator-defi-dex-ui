import { useCallback, useEffect } from "react";
import { useDexContext } from "../../hooks";

const REFRESH_INTERVAL = 12000;

const useSwapPage = () => {
  const { wallet, swap } = useDexContext(({ wallet, swap }) => ({
    wallet,
    swap,
  }));
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
  }, []);

  // on Swap load
  useEffect(() => {
    fetchSwapDataOnLoad();
  }, [fetchSwapDataOnLoad]);

  // on interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSwapDataOnInterval();
    }, REFRESH_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [fetchSwapDataOnInterval]);

  // on Swap transaction success or failure (event)
  useEffect(() => {
    // skip if first time loading
    fetchSwapDataOnEvent();
  }, [fetchSwapDataOnEvent, transactionState.successPayload, transactionState.errorMessage]);
};

export { useSwapPage };
