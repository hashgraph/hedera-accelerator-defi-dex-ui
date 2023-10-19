import { Flex, Grid, GridItem, Link } from "@chakra-ui/react";
import { Text, Color, MetricLabel } from "@shared/ui-kit";
import { useOutletContext } from "react-router-dom";
import { NFTDAODetailsContext } from "./types";
import { getDAOLinksRecordArray, shortEnglishHumanizer } from "../utils";
import { RecentProposals } from "../RecentProposals";
import { useGovernanceDAOProposals } from "@dao/hooks";

export function NFTDAODashboardOverview() {
  const { dao, totalAssetValue, tokenCount, NFTToken } = useOutletContext<NFTDAODetailsContext>();
  const daoLinks = getDAOLinksRecordArray(dao.webLinks);
  const daoProposalsQueryResults = useGovernanceDAOProposals(
    dao.accountEVMAddress,
    dao.tokenId,
    dao.governorAddress,
    dao.assetsHolderAddress
  );
  const { isSuccess, isLoading, isError, error, data: proposals } = daoProposalsQueryResults;
  const recentProposals = proposals
    ?.sort((proposalA, proposalB) => +proposalB.timestamp - +proposalA.timestamp)
    .slice(0, 3);

  return (
    <Flex gap="8" direction="column" layerStyle="dao-dashboard__content-body">
      <Flex gap="4" direction="column">
        <Text.H4_Medium>Overview</Text.H4_Medium>
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem>
            <Flex
              direction="column"
              width="100%"
              height="100%"
              bg={Color.White_02}
              justifyContent="space-between"
              border={`1px solid ${Color.Neutral._200}`}
              borderRadius="4px"
              padding="1.5rem"
              gap="8"
            >
              <Text.P_Medium_Semibold>Assets</Text.P_Medium_Semibold>
              <Flex direction="row">
                <Flex flex={1}>
                  <MetricLabel
                    label="TOTAL ASSETS"
                    labelTextColor={Color.Neutral._500}
                    labelTextStyle="p xsmall medium"
                    labelOpacity="1.0"
                    value={`${totalAssetValue ?? 0}`}
                    valueStyle="p large medium"
                    valueTextColor={Color.Grey_Blue._800}
                    valueUnitSymbol="USD"
                    valueUnitSymbolColor={Color.Grey_Blue._800}
                  />
                </Flex>
                <Flex flex={1}>
                  <MetricLabel
                    label="NFT"
                    labelTextColor={Color.Neutral._500}
                    labelTextStyle="p xsmall medium"
                    labelOpacity="1.0"
                    value={tokenCount ?? 0}
                    valueStyle="p large medium"
                    valueTextColor={Color.Grey_Blue._800}
                  />
                </Flex>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              direction="column"
              width="100%"
              height="100%"
              bg={Color.White_02}
              border={`1px solid ${Color.Neutral._200}`}
              borderRadius="4px"
              padding="1.5rem"
              gap="8"
            >
              <Text.P_Medium_Semibold>Governance</Text.P_Medium_Semibold>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel
                  label="QUORUM"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.quorumThreshold}
                  valueStyle="p large medium"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbol="%"
                  valueUnitSymbolColor={Color.Neutral._900}
                />
                <MetricLabel
                  label="VOTING DURATION"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={shortEnglishHumanizer(dao.votingPeriod * 1000)}
                  valueStyle="p large medium"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbolColor={Color.Neutral._900}
                />

                <MetricLabel
                  label="LOCKING PERIOD"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={shortEnglishHumanizer(dao.votingDelay * 1000)}
                  valueStyle="p large medium"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbolColor={Color.Neutral._900}
                />

                <MetricLabel
                  label="MINIMUM PROPOSAL DEPOSIT"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.minimumProposalDeposit ?? 0}
                  valueStyle="p large medium"
                  valueTextColor={Color.Neutral._900}
                  valueUnitSymbol={NFTToken?.data?.symbol}
                  valueUnitSymbolColor={Color.Neutral._900}
                />
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              width="100%"
              height="100%"
              direction="column"
              bg={Color.White_02}
              justifyContent="space-between"
              border={`1px solid ${Color.Neutral._200}`}
              borderRadius="4px"
              padding="1.5rem"
              gap="8"
            >
              <Text.P_Medium_Semibold>About</Text.P_Medium_Semibold>
              <Text.P_Small_Regular color={Color.Neutral._700}>{dao.description}</Text.P_Small_Regular>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex
              width="100%"
              height="100%"
              gap={6}
              direction="column"
              bg={Color.White_02}
              justifyContent="space-between"
              border={`1px solid ${Color.Neutral._200}`}
              borderRadius="4px"
              padding="1.5rem"
            >
              <Text.P_Medium_Semibold>Social Channels</Text.P_Medium_Semibold>
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
      <Flex gap="2" direction="column">
        <Text.H4_Medium>Recent Proposals</Text.H4_Medium>
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
