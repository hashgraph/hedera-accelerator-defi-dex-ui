import { Flex, Text } from "@chakra-ui/react";
import { Color, MetricLabel } from "@dex-ui-components";
import { useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";

export function DashboardOverview() {
  const { dao, totalAssetValue, memberCount, ownerCount, tokenCount } = useOutletContext<MultiSigDAODetailsContext>();
  const { threshold } = dao;

  const totalAssetDisplay = totalAssetValue;
  const tokenCountDisplay = tokenCount;
  const memberCountDisplay = String(memberCount);
  const thresholdDisplay = `${String(threshold)} / ${String(ownerCount)}`;

  return (
    <Flex gap="8" direction="column">
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Overview</Text>
        <Flex direction="row" gap="2">
          <Flex
            flex="1"
            direction="column"
            bg={Color.White_02}
            justifyContent="space-between"
            width="50%"
            border={`1px solid ${Color.Neutral._200}`}
            borderRadius="4px"
            padding="1.5rem"
            gap="8"
          >
            <Text textStyle="p medium semibold">Assets</Text>
            <Flex direction="row" justifyContent="space-between">
              <MetricLabel label="TOTAL ASSETS" value={totalAssetDisplay} />
              <MetricLabel label="TOKENS" value={tokenCountDisplay} />
            </Flex>
          </Flex>
          <Flex
            flex="1"
            direction="column"
            bg={Color.White_02}
            justifyContent="space-between"
            width="50%"
            border={`1px solid ${Color.Neutral._200}`}
            borderRadius="4px"
            padding="1.5rem"
          >
            <Text textStyle="p medium semibold">Governance</Text>
            <Flex direction="row" justifyContent="space-between">
              <MetricLabel label="MEMBERS" value={memberCountDisplay} />
              <MetricLabel label="THRESHOLD" value={thresholdDisplay} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex gap="4" direction="column">
        <Text textStyle="h4 medium">Recent Proposals</Text>
      </Flex>
    </Flex>
  );
}
