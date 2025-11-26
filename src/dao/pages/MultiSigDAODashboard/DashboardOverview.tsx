import { Flex, Grid, GridItem, Link, ListItem, UnorderedList, useBreakpointValue } from "@chakra-ui/react";
import { Text, Color, MetricLabel, PeopleIcon, TokenIcon } from "@shared/ui-kit";
import { Link as ReachLink, useOutletContext, useParams } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";
import { useDAOProposals } from "@dao/hooks";
import { RecentProposals } from "../RecentProposals";

export function DashboardOverview() {
  const { accountId = "" } = useParams();
  const { dao, totalAssetValue, tokenBalances, members } = useOutletContext<MultiSigDAODetailsContext>();
  const { safeEVMAddress, threshold } = dao;
  const totalAssetDisplay = totalAssetValue;
  const tokenCountDisplay = tokenBalances?.length;
  const memberCountDisplay = String(members.length);
  const thresholdDisplay = `${String(threshold)} / ${String(members.length)}`;
  const daoTransactionsQueryResults = useDAOProposals(accountId, safeEVMAddress);
  const { isSuccess, isLoading, isError, error, data: proposals } = daoTransactionsQueryResults;
  const daoLinks = getDAOLinksRecordArray(dao.webLinks);
  const recentProposals = proposals?.sort((proposalA, proposalB) => proposalA.id - proposalB.id).slice(0, 3);

  const gridColumns = useBreakpointValue({ base: "1fr", md: "repeat(2, 1fr)" });

  return (
    <Flex gap={{ base: 4, md: 8 }} direction="column" layerStyle="dao-dashboard__content-body" height="100%">
      <Flex gap="2" direction="column">
        <Text.H4_Medium>Overview</Text.H4_Medium>
        <Grid templateColumns={gridColumns} gap={{ base: 2, md: 3 }}>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card">
              <Text.P_Medium_Semibold>Assets</Text.P_Medium_Semibold>
              <Flex direction={{ base: "column", sm: "row" }} justifyContent="space-between" gap={{ base: 4, sm: 0 }}>
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
              <Text.P_Medium_Semibold>Governance</Text.P_Medium_Semibold>
              <Flex direction={{ base: "column", sm: "row" }} justifyContent="space-between" gap={{ base: 4, sm: 0 }}>
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
              <Text.P_Medium_Semibold>About</Text.P_Medium_Semibold>
              <Text.P_Small_Regular color={Color.Neutral._700}>{dao.description}</Text.P_Small_Regular>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex layerStyle="dao-dashboard__card" gap={4}>
              <Text.P_Medium_Semibold>Social Channels</Text.P_Medium_Semibold>
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
                          wordBreak="break-all"
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
        <Text.H4_Medium>Recent Proposals</Text.H4_Medium>
        <Flex direction="column" gap="2" minHeight={{ base: "200px", md: "300px" }}>
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
