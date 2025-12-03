import { Flex, Grid, GridItem, Link, useBreakpointValue } from "@chakra-ui/react";
import { Text, Color, MetricLabel, useTheme } from "@shared/ui-kit";
import { useOutletContext } from "react-router-dom";
import { NFTDAODetailsContext } from "./types";
import { getDAOLinksRecordArray, shortEnglishHumanizer } from "../utils";
import { RecentProposals } from "../RecentProposals";
import { useGovernanceDAOProposals } from "@dao/hooks";

export function NFTDAODashboardOverview() {
  const theme = useTheme();
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

  const gridColumns = useBreakpointValue({ base: "1fr", md: "repeat(2, 1fr)" });

  const cardStyle = {
    padding: "1rem",
    bg: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    backdropFilter: "blur(20px)",
    flexDirection: "column" as const,
    width: "100%",
    height: "100%",
    gap: { base: "4", md: "8" },
  };

  return (
    <Flex
      gap={{ base: 4, md: 8 }}
      direction="column"
      minWidth="100%"
      padding={{ base: "1rem", sm: "1rem 1.5rem", md: "1rem 2rem", lg: "1rem 3rem", xl: "1rem 5rem 16px" }}
    >
      <Flex gap="4" direction="column">
        <Text.H4_Medium color={theme.text}>Overview</Text.H4_Medium>
        <Grid templateColumns={gridColumns} gap={{ base: 2, md: 3 }}>
          <GridItem>
            <Flex {...cardStyle}>
              <Text.P_Medium_Semibold color={theme.text}>Assets</Text.P_Medium_Semibold>
              <Flex direction={{ base: "column", sm: "row" }} gap={{ base: 4, sm: 0 }}>
                <Flex flex={1}>
                  <MetricLabel
                    label="TOTAL ASSETS"
                    labelTextColor={theme.textMuted}
                    labelTextStyle="p xsmall medium"
                    labelOpacity="1.0"
                    value={`${totalAssetValue ?? 0}`}
                    valueStyle="p large medium"
                    valueTextColor={theme.text}
                    valueUnitSymbol="USD"
                    valueUnitSymbolColor={theme.text}
                  />
                </Flex>
                <Flex flex={1}>
                  <MetricLabel
                    label="NFT"
                    labelTextColor={theme.textMuted}
                    labelTextStyle="p xsmall medium"
                    labelOpacity="1.0"
                    value={tokenCount ?? 0}
                    valueStyle="p large medium"
                    valueTextColor={theme.text}
                  />
                </Flex>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex {...cardStyle}>
              <Text.P_Medium_Semibold color={theme.text}>Governance</Text.P_Medium_Semibold>
              <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }}>
                <MetricLabel
                  label="QUORUM"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.quorumThreshold}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbol="%"
                  valueUnitSymbolColor={theme.text}
                />
                <MetricLabel
                  label="VOTING DURATION"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={shortEnglishHumanizer(dao.votingPeriod * 1000)}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbolColor={theme.text}
                />
                <MetricLabel
                  label="LOCKING PERIOD"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={shortEnglishHumanizer(dao.votingDelay * 1000)}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbolColor={theme.text}
                />
                <MetricLabel
                  label="MIN DEPOSIT"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={dao.minimumProposalDeposit ?? 0}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbol={NFTToken?.data?.symbol}
                  valueUnitSymbolColor={theme.text}
                />
              </Grid>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex {...cardStyle}>
              <Text.P_Medium_Semibold color={theme.text}>About</Text.P_Medium_Semibold>
              <Text.P_Small_Regular color={theme.textSecondary}>{dao.description}</Text.P_Small_Regular>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex {...cardStyle} gap={4}>
              <Text.P_Medium_Semibold color={theme.text}>Social Channels</Text.P_Medium_Semibold>
              <Flex direction="column" gap={2} justifyContent="space-between">
                {daoLinks.map((link, index) => {
                  return (
                    <Link
                      key={index}
                      textStyle="p small regular"
                      color={theme.accentLight}
                      href={link.value}
                      isExternal
                      wordBreak="break-all"
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
        <Text.H4_Medium color={theme.text}>Recent Proposals</Text.H4_Medium>
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
