import { Text, Accordion } from "@chakra-ui/react";
import { CardListLayout, LoadingSpinnerLayout, TabFilters } from "@layouts";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionStatus, useDAOTransactions, useTabFilters } from "@hooks";

const transactionTabFilters = [[TransactionStatus.Pending], [TransactionStatus.Success, TransactionStatus.Failed]];
const defaultTransactionFilters = [TransactionStatus.Pending, TransactionStatus.Success, TransactionStatus.Failed];

const transactionTabs = [
  { name: "Queue", filter: [] },
  { name: "History", filter: [] },
];

interface TransactionsListProps {
  daoAccountId: string;
  safeAccountId: string;
  threshold: number;
}

export function TransactionsList(props: TransactionsListProps) {
  const { daoAccountId, safeAccountId, threshold } = props;
  const { tabIndex, handleTabChange } = useTabFilters();
  const transactionFilters = transactionTabFilters.at(tabIndex) ?? defaultTransactionFilters;
  const daoTransactionsQueryResults = useDAOTransactions(daoAccountId, safeAccountId, transactionFilters);
  const { isError, isSuccess, isLoading, error, data: transactions } = daoTransactionsQueryResults;

  if (isError) {
    return (
      <Text textStyle="h2_empty_or_error" margin="auto">
        Error: {error?.message}
      </Text>
    );
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess) {
    return (
      <CardListLayout
        onTabChange={handleTabChange}
        tabFilters={<TabFilters filters={transactionTabs} />}
        cardLists={[0, 0].map(() => (
          <Accordion allowToggle={true}>
            {transactions.map((transaction, index) => (
              <TransactionDetails index={index} threshold={threshold} {...transaction} />
            ))}
          </Accordion>
        ))}
      />
    );
  }

  return <></>;
}
