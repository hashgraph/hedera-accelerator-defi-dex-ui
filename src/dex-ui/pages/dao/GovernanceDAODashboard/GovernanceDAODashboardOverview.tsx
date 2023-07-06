import { Flex, Grid, GridItem, Text, Link } from "@chakra-ui/react";
import { Color, MetricLabel } from "@dex-ui-components";
import { convertFromBlocksToDays } from "@utils";
import { useOutletContext } from "react-router-dom";
import { GovernanceDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";
import { useGovernanceDAOProposals } from "@hooks";
import { RecentProposals } from "../RecentProposals";

export function GovernanceDAODashboardOverview() {
  const { dao, totalAssetValue, tokenCount } = useOutletContext<GovernanceDAODetailsContext>();
  const daoLinks = getDAOLinksRecordArray(dao.webLinks);
  const daoProposalsQueryResults = useGovernanceDAOProposals(dao.accountId, dao.tokenId, dao.governors);
  const { isSuccess, isLoading, isError, error, data: proposals } = daoProposalsQueryResults;
  const recentProposals = proposals
    ?.sort((proposalA, proposalB) => +proposalB.timestamp - +proposalA.timestamp)
    .slice(0, 3);

  return (
    <Flex gap="8" direction="column" layerStyle="dao-dashboard__content-body">
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Overview</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Assets</Text>
              <Flex direction="row">
                <Flex flex={1}>
                  <MetricLabel
                    label="TOTAL ASSETS"
                    labelTextColor={Color.Neutral._500}
                    labelTextStyle="p xsmall medium"
                    labelOpacity="1.0"
                    value={totalAssetValue ?? 0}
                    valueStyle="p large semibold"
                    valueTextColor={Color.Grey_Blue._800}
                    valueUnitSymbol="USD"
                    valueUnitSymbolColor={Color.Grey_Blue._800}
                  />
                </Flex>
                <Flex flex={1}>
                  <MetricLabel
                    label="TOKENS"
                    labelTextColor={Color.Neutral._500}
                    labelTextStyle="p xsmall medium"
                    labelOpacity="1.0"
                    value={tokenCount ?? 0}
                    valueStyle="p large semibold"
                    valueTextColor={Color.Grey_Blue._800}
                  />
                </Flex>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text textStyle="p medium semibold">Governance</Text>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel
                  label="QUORUM"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.quorumThreshold ?? 0}
                  valueStyle="p large semibold"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbol="%"
                  valueUnitSymbolColor={Color.Neutral._900}
                />
                <MetricLabel
                  label="VOTING DURATION"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={convertFromBlocksToDays(dao.votingPeriod)}
                  valueStyle="p large semibold"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbol="days"
                  valueUnitSymbolColor={Color.Neutral._900}
                />

                <MetricLabel
                  label="LOCKING PERIOD"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={convertFromBlocksToDays(dao.votingDelay)}
                  valueStyle="p large semibold"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbol="days"
                  valueUnitSymbolColor={Color.Neutral._900}
                />

                <MetricLabel
                  label="MINIMUM PROPOSAL DEPOSIT"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.minimumProposalDeposit ?? 0}
                  valueStyle="p large semibold"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbol="HEY"
                  valueUnitSymbolColor={Color.Neutral._900}
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
            <Flex layerStyle="dao-dashboard__card" gap={6}>
              <Text textStyle="p medium semibold">Social Channels</Text>
              <Flex direction="column" gap={2} justifyContent="space-between">
                {daoLinks.map((link, index) => {
                  return (
                    <Link
                      key={index}
                      textStyle="p small regular"
                      color={Color.Neutral._700}
                      href={link.value}
                      isExternal
                    >
                      {link.value}
                    </Link>
                  );
                })}
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
