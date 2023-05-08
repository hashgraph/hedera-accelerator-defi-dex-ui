import {
  fetchAllDAOs,
  fetchHederaGnosisSafeLogs,
  fetchMultiSigDAOLogs,
  proposeAddOwnerWithThreshold,
  proposeRemoveOwnerWithThreshold,
  proposeSwapOwnerWithThreshold,
  proposeChangeThreshold,
} from "./dao";
import { fetchProposal, fetchAllProposals, fetchAllProposalEvents } from "./governance";
import { fetchAccountTokenBalances } from "./token";

type DexServiceType = ReturnType<typeof createDexService>;

/**
 * General format of service calls:
 * 1 - Convert data types.
 * 2 - Create contract parameters.
 * 3 - Create and sign transaction.
 * 4 - Send transaction to wallet and execute transaction.
 * 5 - Extract and return resulting data.
 */

/**
 * TODO: A single source for all service functions. Wrap in React Query hook for easy access.
 * @returns
 */
function createDexService() {
  return {
    fetchProposal,
    fetchAllProposals,
    fetchAllProposalEvents,
    fetchAccountTokenBalances,
    fetchAllDAOs,
    fetchMultiSigDAOLogs,
    fetchHederaGnosisSafeLogs,
    proposeAddOwnerWithThreshold,
    proposeSwapOwnerWithThreshold,
    proposeRemoveOwnerWithThreshold,
    proposeChangeThreshold,
  };
}

export { createDexService };
export type { DexServiceType };
