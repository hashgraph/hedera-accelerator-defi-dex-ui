import { useDAOs } from "@hooks";
import { GovernanceDAODetails } from "@services";
import { useProposalDetails } from "@dex-ui/pages/ProposalDetails/useProposalDetails";

export function useGovernanceTokenProposalDetails(/* daoAccountId: string,  */ proposalId: string) {
  /*   const daosQueryResults = useDAOs<GovernanceDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao: GovernanceDAODetails) => dao.accountId === daoAccountId); */

  const proposalDetails = useProposalDetails(proposalId);

  return {
    /*     dao,
    daosQueryResults, */
    proposalDetails,
  };
}
