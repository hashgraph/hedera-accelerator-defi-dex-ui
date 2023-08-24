import { isEmpty, isNil } from "ramda";
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
export const useSwapData = (selectedPairContractId: string, refreshInterval = 0) => {
  const isInitialFetch = useRef(true);
  const refreshTimeInterval = useRef<NodeJS.Timeout>();
  const { wallet, swap } = useDexContext(({ wallet, swap }) => ({
    wallet,
    swap,
  }));
  const walletAccountId = wallet.savedPairingData?.accountIds[0];
  const { transactionState, fetchTokenPairs, fetchPairInfo } = swap;

  async function fetchSwapDataOnLoad() {
    await Promise.allSettled([fetchTokenPairs(), fetchPairInfo(selectedPairContractId)]);
  }

  /**
   * Fetches all swap data on first load and change of wallet account ID.
   */
  useEffect(() => {
    fetchSwapDataOnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAccountId]);

  async function fetchSwapDataOnInterval() {
    await fetchPairInfo(selectedPairContractId);
  }
  /**
   * Fetches all swap data on a specified interval (milliseconds).
   */
  useEffect(() => {
    const shouldSetRefreshInterval =
      refreshInterval > 0 && !isEmpty(selectedPairContractId) && isNil(refreshTimeInterval.current);
    const shouldClearInterval = isEmpty(selectedPairContractId) || refreshInterval <= 0;

    if (shouldSetRefreshInterval) {
      refreshTimeInterval.current = setInterval(() => {
        fetchSwapDataOnInterval();
      }, refreshInterval);
    }

    if (shouldClearInterval) {
      clearInterval(refreshTimeInterval.current);
      refreshTimeInterval.current = undefined;
    }

    return () => {
      clearInterval(refreshTimeInterval.current);
      refreshTimeInterval.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPairContractId]);

  /**
   * Fetches all swap data on completion of a transaction event (success or failure) or change of swap pair.
   */
  useEffect(() => {
    if (isInitialFetch.current) {
      isInitialFetch.current = false;
      return;
    }
    /** need to fetch spot fee and fee on change of pairs */
    async function fetchSwapDataOnEvent() {
      await Promise.allSettled([wallet.fetchAccountBalance(), fetchPairInfo(selectedPairContractId)]);
    }
    fetchSwapDataOnEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPairContractId, transactionState.successPayload, transactionState.errorMessage]);
};
