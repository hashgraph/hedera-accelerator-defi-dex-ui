import { CardListLayout, ErrorLayout, LoadingSpinnerLayout, TabFilters } from "@layouts";
import { ProposalStatus, useDAOProposals, useTabFilters } from "@hooks";
import { useOutletContext } from "react-router-dom";
import { ProposalCard } from "../ProposalCard";
import { Flex } from "@chakra-ui/react";
import { DAODetailsContext, DAOType } from "@services";

const transactionTabFilters = [[ProposalStatus.Pending], [ProposalStatus.Success, ProposalStatus.Failed]];
const defaultTransactionFilters = [ProposalStatus.Pending, ProposalStatus.Success, ProposalStatus.Failed];

const transactionTabs = [
  { name: "Active", filter: [] },
  { name: "History", filter: [] },
];

export function ProposalList() {
  const { dao } = useOutletContext<DAODetailsContext>();
  const { accountId: daoAccountId } = dao;
  // TODO: fetch dao keys for proposal for each doa types by typecasting and use respective proposal hook.
  let safeAccountId = "";
  let tokenId = "";
  let governanceAddress = "";
  if (dao.type === DAOType.MultiSig) {
    safeAccountId = dao.safeId;
  } else if (dao.type === DAOType.GovernanceToken) {
    tokenId = dao.tokenId;
    //TODO: For Future Proposals Card PR, send all governors contract for fetching all proposal
    governanceAddress = dao.governors.tokenTransferLogic;
  }
  const { tabIndex, handleTabChange } = useTabFilters();
  const transactionFilters = transactionTabFilters.at(tabIndex) ?? defaultTransactionFilters;

  // TODO: break dao proposal hooks for each dao types.
  const daoTransactionsQueryResults = useDAOProposals(
    daoAccountId,
    dao.type,
    safeAccountId,
    transactionFilters,
    governanceAddress,
    tokenId
  );
  const { isSuccess, isLoading, isError, error, data: transactions } = daoTransactionsQueryResults;

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess) {
    return (
      <CardListLayout
        onTabChange={handleTabChange}
        tabFilters={
          <Flex layerStyle="dao-dashboard__content-header--with-tabs">
            <TabFilters filters={transactionTabs} />
          </Flex>
        }
        cardListLayerStyles="dao-dashboard__content-body"
        cardLists={[<></>, <></>].map(() =>
          transactions?.map((transaction, index) => <ProposalCard proposal={transaction} dao={dao} key={index} />)
        )}
      />
    );
  }

  return <></>;
}
