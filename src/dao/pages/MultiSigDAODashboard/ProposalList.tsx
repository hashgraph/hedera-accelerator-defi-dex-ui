import {
  CardListLayout,
  ErrorLayout,
  LoadingSpinnerLayout,
  NotFound,
  Page,
  PageLayout,
  TabFilters,
} from "@dex/layouts";
import { useTabFilters } from "@dex/hooks";
import { Proposal, ProposalStatus, useDAOProposals, useGovernanceDAOProposals } from "@dao/hooks";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ProposalCard } from "../ProposalCard";
import { Flex } from "@chakra-ui/react";
import { DAODetailsContext, GovernanceDAODetails, MultiSigDAODetails } from "@dao/services";
import { TransactionIcon, Color, usePagination, Pagination } from "@shared/ui-kit";
import { isNotNil, isEmpty } from "ramda";
import { replaceLastRoute } from "@dex/utils";
import { Routes } from "@dao/routes";

const PageLimit = 10;

const transactionTabFilters = [
  [ProposalStatus.Pending, ProposalStatus.Queued],
  [ProposalStatus.Success, ProposalStatus.Failed],
];
const defaultTransactionFilters = [
  ProposalStatus.Pending,
  ProposalStatus.Queued,
  ProposalStatus.Success,
  ProposalStatus.Failed,
];

const transactionTabs = [
  { name: "Active", filter: [] },
  { name: "History", filter: [] },
];

export function ProposalList() {
  const { accountId: daoAccountId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { dao } = useOutletContext<DAODetailsContext>();
  const { safeEVMAddress } = dao as MultiSigDAODetails;
  const { tokenId = "", governorAddress, assetsHolderAddress } = dao as GovernanceDAODetails;
  const { tabIndex, handleTabChange } = useTabFilters();
  const transactionFilters = transactionTabFilters.at(tabIndex) ?? defaultTransactionFilters;

  const multiSigDAOTransactionsQueryResults = useDAOProposals(daoAccountId, safeEVMAddress, transactionFilters);
  const {
    isSuccess: multiSigTransactionSuccess,
    isLoading: multiSigTransactionLoading,
    isError: multiSigTransactionFailed,
    error: multiSigTransactionError,
    data: multiSigTransactions,
  } = multiSigDAOTransactionsQueryResults;

  const governanceDaoTransactionsQueryResults = useGovernanceDAOProposals(
    daoAccountId,
    tokenId,
    governorAddress,
    assetsHolderAddress,
    transactionFilters
  );
  const {
    isSuccess: govTransactionSuccess,
    isLoading: govTransactionLoading,
    isError: govTransactionFailed,
    error: govTransactionError,
    data: govTransactions,
  } = governanceDaoTransactionsQueryResults;

  const transactions = multiSigTransactions || govTransactions;
  const isError = multiSigTransactionFailed || govTransactionFailed;
  const isSuccess = multiSigTransactionSuccess || govTransactionSuccess;
  const isLoading = multiSigTransactionLoading || govTransactionLoading;
  const error = multiSigTransactionError || govTransactionError;

  const hasTransactions = isNotNil(transactions) && !isEmpty(transactions);

  const {
    paginatedData: paginatedProposals,
    pageCount,
    isPaginationVisible,
    isPreviousButtonVisible,
    isNextButtonVisible,
    handlePageClick,
  } = usePagination<Proposal>({ data: transactions ?? [], pageLimit: PageLimit });

  function handleClickCreateProposal() {
    navigate(replaceLastRoute(location.pathname, Routes.CreateDAOProposal));
  }

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess) {
    return (
      <Page
        gap={0}
        type={PageLayout.Dashboard}
        body={
          <CardListLayout
            onTabChange={handleTabChange}
            tabFilters={
              <Flex layerStyle="dao-dashboard__content-header--with-tabs">
                <TabFilters filters={transactionTabs} />
              </Flex>
            }
            cardListLayerStyles="dao-dashboard__content-body"
            cardLists={
              hasTransactions
                ? [<></>, <></>].map(() =>
                    paginatedProposals?.map((transaction, index) => (
                      <ProposalCard proposal={transaction} dao={dao} key={index} />
                    ))
                  )
                : [<></>, <></>].map(() => (
                    <Flex direction="column" gap="2" minHeight="300px" key="not-found">
                      <NotFound
                        icon={<TransactionIcon boxSize="4rem" stroke={Color.Neutral._900} />}
                        message={`We didn't find any ${tabIndex === 0 ? "active" : "past"} proposals.`}
                        linkText="Create a proposal."
                        onLinkClick={handleClickCreateProposal}
                      />
                    </Flex>
                  ))
            }
            paginationComponent={
              <Pagination
                pageCount={pageCount}
                customPaginationStyles={{ paddingRight: "5rem" }}
                isPaginationVisible={isPaginationVisible}
                isPreviousButtonVisible={isPreviousButtonVisible}
                isNextButtonVisible={isNextButtonVisible}
                handlePageClick={handlePageClick}
              />
            }
          />
        }
      />
    );
  }

  return <></>;
}
