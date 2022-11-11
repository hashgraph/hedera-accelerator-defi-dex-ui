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
   * Fetches all governance data on first load.
   */
  useEffect(() => {
    fetchGovernanceDataOnLoad();
  }, [fetchGovernanceDataOnLoad]);
};
