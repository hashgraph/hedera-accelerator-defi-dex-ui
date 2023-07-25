import { Flex, Text, Grid, GridItem, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { Color, MetricLabel, PeopleIcon, TokenIcon } from "@dex-ui-components";
import { Link as ReachLink, useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";
import { useDAOProposals } from "@hooks";
import { RecentProposals } from "../RecentProposals";

export function DashboardOverview() {
  const { dao, totalAssetValue, tokenBalances, members } = useOutletContext<MultiSigDAODetailsContext>();
  const { accountId, safeId, threshold } = dao;
  const totalAssetDisplay = totalAssetValue;
  const tokenCountDisplay = tokenBalances?.length;
  const memberCountDisplay = String(members.length);
  const thresholdDisplay = `${String(threshold)} / ${String(members.length)}`;
  const daoTransactionsQueryResults = useDAOProposals(accountId, safeId);
  const { isSuccess, isLoading, isError, error, data: proposals } = daoTransactionsQueryResults;
  const daoLinks = getDAOLinksRecordArray(dao.webLinks);
  const recentProposals = proposals?.sort((proposalA, proposalB) => proposalA.id - proposalB.id).slice(0, 3);

  return (
    <Flex gap="8" direction="column" layerStyle="dao-dashboard__content-body" height="100%">
      <Flex gap="2" direction="column">
        <Text textStyle="h4 medium">Overview</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap="2">
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Assets</Text>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel
                  label="TOTAL VALUE"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={`$${totalAssetDisplay}`}
                  valueStyle="p large medium"
                  valueTextColor={Color.Grey_Blue._800}
                  valueUnitSymbol="USD"
                  valueUnitSymbolColor={Color.Grey_Blue._800}
                />
                <MetricLabel
                  label="TOKENS"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={tokenCountDisplay}
                  valueStyle="p large medium"
                  valueUnitSymbol={<TokenIcon fill={Color.Grey_Blue._800} />}
                  valueTextColor={Color.Grey_Blue._800}
                />
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Governance</Text>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel
                  label="MEMBERS"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={memberCountDisplay}
                  valueStyle="p large medium"
                  valueTextColor={Color.Grey_Blue._800}
                  valueUnitSymbol={<PeopleIcon />}
                  valueUnitSymbolColor={Color.Grey_Blue._800}
                />
                <MetricLabel
                  label="THRESHOLD"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={thresholdDisplay}
                  valueStyle="p large medium"
                  valueTextColor={Color.Grey_Blue._800}
                  valueUnitSymbol={<PeopleIcon />}
                  valueUnitSymbolColor={Color.Grey_Blue._800}
                />
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
      <Flex gap="2" direction="column" height="100%">
        <Text textStyle="h4 medium">Recent Proposals</Text>
        <Flex direction="column" gap="2" height="100%">
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
