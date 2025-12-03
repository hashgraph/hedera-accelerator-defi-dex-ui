import { Flex, Grid, GridItem, Link, ListItem, UnorderedList, useBreakpointValue } from "@chakra-ui/react";
import { Text, Color, MetricLabel, PeopleIcon, TokenIcon, useTheme } from "@shared/ui-kit";
import { Link as ReachLink, useOutletContext, useParams } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { getDAOLinksRecordArray } from "../utils";
import { useDAOProposals } from "@dao/hooks";
import { RecentProposals } from "../RecentProposals";

export function DashboardOverview() {
  const { accountId = "" } = useParams();
  const theme = useTheme();
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
      height="100%"
    >
      <Flex gap="2" direction="column">
        <Text.H4_Medium color={theme.text}>Overview</Text.H4_Medium>
        <Grid templateColumns={gridColumns} gap={{ base: 2, md: 3 }}>
          <GridItem>
            <Flex {...cardStyle}>
              <Text.P_Medium_Semibold color={theme.text}>Assets</Text.P_Medium_Semibold>
              <Flex direction={{ base: "column", sm: "row" }} justifyContent="space-between" gap={{ base: 4, sm: 0 }}>
                <MetricLabel
                  label="TOTAL VALUE"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={`$${totalAssetDisplay}`}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbol="USD"
                  valueUnitSymbolColor={theme.text}
                />
                <MetricLabel
                  label="TOKENS"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={tokenCountDisplay}
                  valueStyle="p large medium"
                  valueUnitSymbol={<TokenIcon fill={theme.text} />}
                  valueTextColor={theme.text}
                />
              </Flex>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex {...cardStyle}>
              <Text.P_Medium_Semibold color={theme.text}>Governance</Text.P_Medium_Semibold>
              <Flex direction={{ base: "column", sm: "row" }} justifyContent="space-between" gap={{ base: 4, sm: 0 }}>
                <MetricLabel
                  label="MEMBERS"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={memberCountDisplay}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbol={<PeopleIcon />}
                  valueUnitSymbolColor={theme.text}
                />
                <MetricLabel
                  label="THRESHOLD"
                  labelTextColor={theme.textMuted}
                  labelTextStyle="p xsmall medium"
                  labelOpacity="1.0"
                  value={thresholdDisplay}
                  valueStyle="p large medium"
                  valueTextColor={theme.text}
                  valueUnitSymbol={<PeopleIcon />}
                  valueUnitSymbolColor={theme.text}
                />
              </Flex>
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
                <UnorderedList>
                  {daoLinks.map((link, index) => {
                    return (
                      <ListItem key={index} color={theme.textSecondary}>
                        <Link
                          as={ReachLink}
                          textStyle="p small regular link"
                          color={theme.accentLight}
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
