import { CardListLayout, ErrorLayout, LoadingSpinnerLayout, TabFilters } from "@layouts";
import { TransactionCard } from "./TransactionCard";
import { ProposalStatus, useDAOProposals, useTabFilters } from "@hooks";
import { useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";

const transactionTabFilters = [[ProposalStatus.Pending], [ProposalStatus.Success, ProposalStatus.Failed]];
const defaultTransactionFilters = [ProposalStatus.Pending, ProposalStatus.Success, ProposalStatus.Failed];

const transactionTabs = [
  { name: "Active", filter: [] },
  { name: "History", filter: [] },
];

export function TransactionsList() {
  const { dao } = useOutletContext<MultiSigDAODetailsContext>();
  const { accountId: daoAccountId, safeId: safeAccountId, threshold } = dao;
  const { tabIndex, handleTabChange } = useTabFilters();
  const transactionFilters = transactionTabFilters.at(tabIndex) ?? defaultTransactionFilters;

  const daoTransactionsQueryResults = useDAOProposals(daoAccountId, safeAccountId, transactionFilters);
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
        tabFilters={<TabFilters filters={transactionTabs} />}
        cardLists={[<></>, <></>].map(() =>
          transactions?.map((transaction, index) => (
            <TransactionCard index={index} threshold={threshold} {...transaction} />
          ))
        )}
      />
    );
  }

  return <></>;
}
