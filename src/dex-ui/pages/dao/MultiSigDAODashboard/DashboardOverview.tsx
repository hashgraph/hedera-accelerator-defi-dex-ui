import { Flex, Text, Grid, GridItem, Link } from "@chakra-ui/react";
import { Color, MetricLabel } from "@dex-ui-components";
import { useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";

export function DashboardOverview() {
  const { dao, totalAssetValue, memberCount, ownerCount, tokenCount } = useOutletContext<MultiSigDAODetailsContext>();
  const { threshold } = dao;
  const totalAssetDisplay = totalAssetValue;
  const tokenCountDisplay = tokenCount;
  const memberCountDisplay = String(memberCount);
  const thresholdDisplay = `${String(threshold)} / ${String(ownerCount)}`;

  const daoLinks = getDAOLinksRecordArray(dao.webLinks);
  return (
    <Flex gap="8" direction="column">
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
      </Flex>
    </Flex>
  );
}
