import { Flex, Text, Grid, GridItem, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { Color, MetricLabel, TransactionIcon } from "@dex-ui-components";
import { Link as ReachLink, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";
import { useDAOProposals } from "@hooks";
import { ProposalCard } from "../ProposalCard";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@layouts";
import { isEmpty, isNotNil } from "ramda";
import { Paths } from "@routes";
import { replaceLastRoute } from "@utils";

export function DashboardOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dao, totalAssetValue, memberCount, ownerCount, tokenCount } = useOutletContext<MultiSigDAODetailsContext>();
  const { accountId, type, safeId, threshold } = dao;
  const totalAssetDisplay = totalAssetValue;
  const tokenCountDisplay = tokenCount;
  const memberCountDisplay = String(memberCount);
  const thresholdDisplay = `${String(threshold)} / ${String(ownerCount)}`;
  const daoTransactionsQueryResults = useDAOProposals(accountId, type, safeId);
  const { isSuccess, isLoading, isError, error, data: transactions } = daoTransactionsQueryResults;
  const daoLinks = getDAOLinksRecordArray(dao.webLinks);

  function handleClickCreateProposal() {
    navigate(replaceLastRoute(location.pathname, Paths.DAOs.CreateDAOProposal));
  }

  function getRecentProposalList() {
    if (isError) {
      return <ErrorLayout message={error?.message} />;
    }

    if (isLoading) {
      return <LoadingSpinnerLayout />;
    }

    if (isSuccess && isNotNil(transactions) && !isEmpty(transactions)) {
      return transactions
        ?.sort((proposalA, proposalB) => proposalA.id - proposalB.id)
        .slice(0, 3)
        .map((transaction, index) => <ProposalCard proposal={transaction} dao={dao} key={index} />);
    }

    return (
      <NotFound
        icon={<TransactionIcon boxSize="4rem" stroke={Color.Neutral._900} />}
        message={`We didn't find any recent proposals.`}
        linkText="Create a proposal."
        onLinkClick={handleClickCreateProposal}
      />
    );
  }

  const RecentProposalsList = getRecentProposalList();

  return (
    <Flex gap="8" direction="column" layerStyle="dao-dashboard__content-body">
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Overview</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Assets</Text>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel label="TOTAL ASSETS" value={totalAssetDisplay} />
                <MetricLabel label="TOKENS" value={tokenCountDisplay} />
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Governance</Text>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel label="MEMBERS" value={memberCountDisplay} />
                <MetricLabel label="THRESHOLD" value={thresholdDisplay} />
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">About</Text>
              <Text textStyle="p small regular" color={Color.Neutral._700}>
                {dao.description}
              </Text>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Social Channels</Text>
              <Flex direction="column" gap={2} justifyContent="space-between">
                <UnorderedList>
                  {daoLinks.map((link, index) => {
                    return (
                      <ListItem>
                        <Link
                          key={index}
                          as={ReachLink}
                          textStyle="p small regular link"
                          color={Color.Primary._500}
                          to={link.value}
                          isExternal
                        >
                          {link.value}
                        </Link>
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Recent Proposals</Text>
        <Flex direction="column" gap="2" minHeight="300px">
          {RecentProposalsList}
        </Flex>
      </Flex>
    </Flex>
  );
}
