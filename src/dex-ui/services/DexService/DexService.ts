import {
  fetchAllDAOs,
  fetchHederaGnosisSafeLogs,
  fetchMultiSigDAOLogs,
  fetchGovernanceDAOLogs,
  proposeAddOwnerWithThreshold,
  proposeRemoveOwnerWithThreshold,
  proposeSwapOwnerWithThreshold,
  proposeChangeThreshold,
  sendApproveMultiSigTransaction,
  sendExecuteMultiSigTransaction,
  fetchNFTDAOLogs,
} from "./dao";
import { fetchProposal, fetchAllProposals, fetchAllProposalEvents, fetchCanUserClaimGODTokens } from "./governance";
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
    fetchGovernanceDAOLogs,
    fetchNFTDAOLogs,
    fetchHederaGnosisSafeLogs,
    proposeAddOwnerWithThreshold,
    proposeRemoveOwnerWithThreshold,
    proposeSwapOwnerWithThreshold,
    proposeChangeThreshold,
    sendApproveMultiSigTransaction,
    sendExecuteMultiSigTransaction,
    fetchCanUserClaimGODTokens,
    associateTokenToSafe,
  };
}

export { createDexService };
export type { DexServiceType };
