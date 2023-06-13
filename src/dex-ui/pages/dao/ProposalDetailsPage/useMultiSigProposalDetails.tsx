import { useDAOs, useDAOProposals } from "@hooks";
import { MultiSigDAODetails } from "@services";
import { isNotNil } from "ramda";

export function useMultiSigProposalDetails(daoAccountId: string, transactionHash: string) {
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao: MultiSigDAODetails) => dao.accountId === daoAccountId);
  const daoProposalsQueryResults = useDAOProposals(daoAccountId, dao?.safeId ?? "");
  const { data: proposals } = daoProposalsQueryResults;
  const proposal = proposals?.find((proposal) => proposal.transactionHash === transactionHash);
  const isDataFetched =
    daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess && isNotNil(dao) && isNotNil(proposal);

  return {
    proposalDetails: isDataFetched
      ? {
          ...proposal,
          daoType: dao?.type,
          threshold: dao?.threshold,
          ownerIds: dao?.ownerIds,
        }
      : undefined,
    isSuccess: daosQueryResults.isSuccess && daoProposalsQueryResults.isSuccess,
    isLoading: daosQueryResults.isLoading || daoProposalsQueryResults.isLoading,
    isError: daosQueryResults.isError || daoProposalsQueryResults.isError,
    error: daosQueryResults.error || daoProposalsQueryResults.error,
    refetch: () => {
      daosQueryResults.refetch();
      daoProposalsQueryResults.refetch();
    },
  };
}
