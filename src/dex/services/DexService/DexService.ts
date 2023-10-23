import daoSDK from "@dao/services";
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
    fetchAllDAOs: daoSDK.fetchAllDAOs,
    fetchMultiSigDAOLogs: daoSDK.fetchMultiSigDAOLogs,
    fetchGovernanceDAOLogs: daoSDK.fetchGovernanceDAOLogs,
    fetchHederaGnosisSafeLogs: daoSDK.fetchHederaGnosisSafeLogs,
    proposeAddOwnerWithThreshold: daoSDK.proposeAddOwnerWithThreshold,
    proposeRemoveOwnerWithThreshold: daoSDK.proposeRemoveOwnerWithThreshold,
    proposeSwapOwnerWithThreshold: daoSDK.proposeSwapOwnerWithThreshold,
    proposeChangeThreshold: daoSDK.proposeChangeThreshold,
    sendApproveMultiSigTransaction: daoSDK.sendApproveMultiSigTransaction,
    sendExecuteMultiSigTransaction: daoSDK.sendExecuteMultiSigTransaction,
    fetchCanUserClaimGODTokens,
    proposeMultiSigTextProposal: daoSDK.proposeMultiSigTextProposal,
    sendChangeAdminForProposalTransaction: daoSDK.sendChangeAdminForProposalTransaction,
    sendTransferOwnershipTransaction: daoSDK.sendTransferOwnershipTransaction,
  };
}

export { createDexService };
export type { DexServiceType };
