import { CardListLayout, ErrorLayout, LoadingSpinnerLayout, NotFound, TabFilters } from "@layouts";
import { ProposalStatus, useDAOProposals, useTabFilters } from "@hooks";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { ProposalCard } from "../ProposalCard";
import { Flex } from "@chakra-ui/react";
import { DAODetailsContext, DAOType } from "@services";
import { TransactionIcon, Color } from "@dex-ui-components";
import { isNotNil, isEmpty } from "ramda";
import { replaceLastRoute } from "@utils";
import { Paths } from "@routes";

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
  const navigate = useNavigate();
  const location = useLocation();
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
  const hasTransactions = isNotNil(transactions) && !isEmpty(transactions);

  function handleClickCreateProposal() {
    navigate(replaceLastRoute(location.pathname, Paths.DAOs.CreateDAOProposal));
  }

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess) {
    return (
      <>
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
                  transactions?.map((transaction, index) => (
                    <ProposalCard proposal={transaction} dao={dao} key={index} />
                  ))
                )
              : [<></>, <></>].map(() => (
                  <Flex direction="column" gap="2" minHeight="300px">
                    <NotFound
                      icon={<TransactionIcon boxSize="4rem" stroke={Color.Neutral._900} />}
                      message={`We didn't find any ${tabIndex === 0 ? "active" : "past"} proposals.`}
                      linkText="Create a proposal."
                      onLinkClick={handleClickCreateProposal}
                    />
                  </Flex>
                ))
          }
        />
      </>
    );
  }

  return <></>;
}
