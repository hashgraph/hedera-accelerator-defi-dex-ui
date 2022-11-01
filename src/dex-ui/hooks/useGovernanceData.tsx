import { useCallback, useEffect } from "react";
import { useDexContext } from ".";

/**
 * Fetches governance data on page load.
 */
export const useGovernanceData = () => {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const { fetchProposals } = governance;

  const fetchGovernanceDataOnLoad = useCallback(async () => {
    await fetchProposals();
  }, [fetchProposals]);

  /**
   * Fetches all pool data on first load and change of wallet account ID.
   */
  useEffect(() => {
    fetchGovernanceDataOnLoad();
  }, [fetchGovernanceDataOnLoad]);
};
