import { CardListLayout, ErrorLayout, LoadingSpinnerLayout, TabFilters } from "@layouts";
import { ProposalStatus, useDAOProposals, useTabFilters } from "@hooks";
import { useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { ProposalCard } from "../ProposalCard";
import { Flex } from "@chakra-ui/react";

const transactionTabFilters = [[ProposalStatus.Pending], [ProposalStatus.Success, ProposalStatus.Failed]];
const defaultTransactionFilters = [ProposalStatus.Pending, ProposalStatus.Success, ProposalStatus.Failed];

const transactionTabs = [
  { name: "Active", filter: [] },
  { name: "History", filter: [] },
];

export function TransactionsList() {
  const { dao } = useOutletContext<MultiSigDAODetailsContext>();
  const { accountId: daoAccountId, safeId: safeAccountId } = dao;
  const { tabIndex, handleTabChange } = useTabFilters();
  const transactionFilters = transactionTabFilters.at(tabIndex) ?? defaultTransactionFilters;

  const daoTransactionsQueryResults = useDAOProposals(daoAccountId, dao.type, safeAccountId, transactionFilters);
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
