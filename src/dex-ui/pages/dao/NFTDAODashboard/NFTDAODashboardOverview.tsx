import { Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { Color, GlobeIcon, InstagramIcon, MetricLabel, TwitterIcon } from "@dex-ui-components";
import { useOutletContext } from "react-router-dom";
import { NFTDAODetailsContext } from "./types";

export function NFTDAODashboardOverview() {
  const { dao, totalAssetValue, tokenCount } = useOutletContext<NFTDAODetailsContext>();
  return (
    <Flex gap="8" direction="column">
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Overview</Text>
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
                    label="NFT"
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
              <Text textStyle="p medium semibold">Governance</Text>
              <Flex direction="row" justifyContent="space-between">
                <MetricLabel
                  label="QUORUM"
                  labelTextColor={Color.Neutral._500}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.quorumThreshold}
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
                  value={dao.votingPeriod}
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
                  value={dao.votingDelay}
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
              <Text textStyle="p medium semibold">About</Text>
              <Text textStyle="p">{dao.name}</Text>
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
              <Text textStyle="p medium semibold">Social Channels</Text>
              <Flex direction="column" gap={2} justifyContent="space-between">
                <Flex direction="row" gap={4}>
                  <GlobeIcon />
                  <Text textStyle="p small regular"> Official website</Text>
                </Flex>
                <Flex direction="row" gap={4}>
                  <InstagramIcon />
                  <Text textStyle="p small regular"> Official Instagram channel</Text>
                </Flex>
                <Flex direction="row" gap={4}>
                  <TwitterIcon />
                  <Text textStyle="p small regular"> Official Twitter channel</Text>
                </Flex>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Recent Transactions</Text>
      </Flex>
    </Flex>
  );
}
