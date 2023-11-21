import { useLocation, useNavigate } from "react-router-dom";
import { Text, Button, Flex, Grid, GridItem, Circle, Input, Spacer, Center, Box } from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import { Notification, NotficationTypes, CardList, Pagination, usePagination, RangeDatePicker } from "@shared/ui-kit";
import { createHashScanTransactionLink } from "@dex/utils";
import { CardListLayout, Page, PageHeader, TabFilter, TabFilters } from "@dex/layouts";
import { useAllProposals, useTabFilters } from "@dex/hooks";
import { ProposalStatus } from "@dex/store";
import { ProposalCard } from "./ProposalCard";
import { useInput } from "@dex/hooks";
import { useDateRange } from "@dex/hooks/useDateRange";
import { FormattedProposal } from "./types";
import { VotingPower } from "./VotingPower";
import { Paths } from "@dex/routes";
import { CreateProposalLocationProps } from "@dex/pages";
import { GovernanceTokenId, Contracts } from "@dex/services";

const PageLimit = 20;

const VOTING_KEYS: { value: string; color: string }[] = [
  { value: "Yes", color: "#79B54B" },
  { value: "No", color: "#EE2B00" },
  { value: "Abstain", color: "#000AFF" },
  { value: "Remain", color: "#DBDEDF" },
];

const proposalTabFilters: TabFilter<ProposalStatus>[] = [
  { name: "All Proposals", filters: [...Object.values(ProposalStatus)] },
  { name: "Active Proposals", filters: [ProposalStatus.Active] },
  { name: "Inactive Proposals", filters: [ProposalStatus.Passed, ProposalStatus.Failed] },
];

/**
 * Page layout component for Governance page.
 * @returns Governance page.
 */
export const Governance = (): ReactElement => {
  const { tabIndex, handleTabChange } = useTabFilters();
  const { value: proposalTitleFilter, handleChange: handleProposalTitleFilterChange } = useInput<string>("");
  const { startDate, endDate, handleChange: handleProposalDatesFilterChange } = useDateRange(null, null);
  const {
    data: proposals,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useAllProposals({
    titleFilter: proposalTitleFilter,
    statusFilters: proposalTabFilters.at(tabIndex)?.filters,
    startDate,
    endDate,
  });
  const {
    paginatedData: paginatedProposals,
    pageCount,
    isPaginationVisible,
    isPreviousButtonVisible,
    isNextButtonVisible,
    handlePageClick,
  } = usePagination<FormattedProposal>({ data: proposals ?? [], pageLimit: PageLimit });
  const navigate = useNavigate();
  const locationState = useLocation().state as CreateProposalLocationProps;
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(
    locationState?.isProposalCreationSuccessful ?? false
  );
  const hashScanLink = createHashScanTransactionLink(locationState?.proposalTransactionId);
  const handleClickNotificationCloseButton = () => setIsNotificationVisible(false);
  const handleClickNewProposalButton = () => navigate(Paths.Governance.CreateNewProposal);

  return (
    <Page
      header={
        <>
          {isNotificationVisible && (
            <Center>
              <Box padding="16px 80px 0 80px" maxWidth="fit-content" paddingTop="1rem">
                <Notification
                  type={NotficationTypes.SUCCESS}
                  message={`You have created ${locationState?.proposalTitle}`}
                  isLinkShown={true}
                  linkText="View in HashScan"
                  linkRef={hashScanLink}
                  isCloseButtonShown={true}
                  isVisible={isNotificationVisible}
                  handleClickClose={handleClickNotificationCloseButton}
                />
              </Box>
            </Center>
          )}
          <PageHeader
            leftContent={[
              <Text key="1" textStyle="h2">
                Proposals
              </Text>,
            ]}
            rightContent={[
              <Button
                key="2"
                padding="0px 20px"
                data-testid="new-proposal-button"
                onClick={handleClickNewProposalButton}
              >
                New Proposal
              </Button>,
            ]}
          />
          <VotingPower governanceTokenId={GovernanceTokenId} tokenHolderAddress={Contracts.GODHolder.ProxyId} />
        </>
      }
      body={
        <Grid templateColumns="repeat(1, 1fr)" gap={8} width="100%">
          <GridItem justifySelf="right">
            <Flex direction="row" gap="4">
              {VOTING_KEYS.map((metric, index) => (
                <Flex key={index} gap="1" width="fit-content">
                  <Circle size="1em" bg={metric.color} />
                  <Text textStyle="h4">{metric.value}</Text>
                </Flex>
              ))}
            </Flex>
          </GridItem>
          <GridItem colSpan={1}>
            <CardListLayout
              onTabChange={handleTabChange}
              tabFilters={<TabFilters<ProposalStatus> filters={proposalTabFilters} />}
              inputFilters={
                <>
                  <RangeDatePicker
                    placeholder="Filter By Date"
                    startDate={startDate}
                    endDate={endDate}
                    onSelection={(dates: any) => {
                      const [startDate, endDate] = dates;
                      handleProposalDatesFilterChange(startDate, endDate);
                    }}
                  />
                  <Spacer padding="0.5rem" />
                  <Input
                    variant="filter"
                    value={proposalTitleFilter}
                    onChange={handleProposalTitleFilterChange}
                    placeholder="Filter By Name"
                    flex="1"
                    minWidth="300px"
                  />
                </>
              }
              cardLists={proposalTabFilters.map((_, index2) => (
                <CardList key={index2} error={error} isSuccess={isSuccess} isLoading={isLoading} isError={isError}>
                  {paginatedProposals?.map((proposal, index) => (
                    <ProposalCard proposal={proposal} key={index} />
                  ))}
                </CardList>
              ))}
              paginationComponent={
                <Pagination
                  pageCount={pageCount}
                  isPaginationVisible={isPaginationVisible}
                  isPreviousButtonVisible={isPreviousButtonVisible}
                  isNextButtonVisible={isNextButtonVisible}
                  handlePageClick={handlePageClick}
                />
              }
            />
          </GridItem>
        </Grid>
      }
    />
  );
};
