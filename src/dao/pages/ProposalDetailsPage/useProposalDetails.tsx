import { useDAOs, useDAOProposals, useFetchContract } from "@dao/hooks";
import { GovernanceDAODetails } from "@dao/services";
import { isNotNil } from "ramda";

export function useProposalDetails(daoAccountId: string, transactionHash: string) {
  const daoAccountIdQueryResults = useFetchContract(daoAccountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs<GovernanceDAODetails>();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() === daoAccountEVMAddress?.toLowerCase());
  const daoProposalsQueryResults = useDAOProposals(daoAccountId);
  const { data: proposals } = daoProposalsQueryResults;
  const proposal = proposals?.find((proposal) => proposal.transactionHash === transactionHash);
  const isDataFetched =
    daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess && isNotNil(dao) && isNotNil(proposal);

  console.log("proposals", proposal);
  return {
    proposalDetails: isDataFetched
      ? {
          ...proposal,
          daoType: dao?.type,
          threshold: dao?.quorumThreshold,
          tokenId: dao?.tokenId,
        }
      : undefined,
    isSuccess: daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess,
    isLoading: daosQueryResults.isLoading || daoProposalsQueryResults.isLoading,
    isError: daosQueryResults.isError || daoProposalsQueryResults.isError,
    error: daosQueryResults.error || daoProposalsQueryResults.error,
  };
}
