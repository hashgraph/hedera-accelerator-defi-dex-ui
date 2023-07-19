import { Flex, Text, Grid, GridItem, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { Color, MetricLabel } from "@dex-ui-components";
import { Link as ReachLink, useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";
import { useDAOProposals } from "@hooks";
import { RecentProposals } from "../RecentProposals";

export function DashboardOverview() {
  const { dao, totalAssetValue, memberCount, ownerCount, tokenCount } = useOutletContext<MultiSigDAODetailsContext>();
  const { accountId, safeId, threshold } = dao;
  const totalAssetDisplay = `${totalAssetValue ?? 0} USD`;
  const tokenCountDisplay = tokenCount;
  const memberCountDisplay = String(memberCount);
  const thresholdDisplay = `${String(threshold)} / ${String(ownerCount)}`;
  const daoTransactionsQueryResults = useDAOProposals(accountId, safeId);
  const { isSuccess, isLoading, isError, error, data: proposals } = daoTransactionsQueryResults;
  const daoLinks = getDAOLinksRecordArray(dao.webLinks);
  const recentProposals = proposals?.sort((proposalA, proposalB) => proposalA.id - proposalB.id).slice(0, 3);

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
                      <ListItem key={index}>
                        <Link
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
          <RecentProposals
            proposals={recentProposals}
            dao={dao}
            isLoading={isLoading}
            isSuccess={isSuccess}
            isError={isError}
            error={error}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
