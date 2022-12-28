import { useLocation, useNavigate } from "react-router-dom";
import { Text, Button, Flex, Grid, GridItem, Circle, Input } from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import { Notification, NotficationTypes, CardList, Pagination, usePagination } from "../../../dex-ui-components";
import { CreateProposalLocationProps } from "../CreateProposal";
import { createHashScanLink } from "../../utils";
import { CardListLayout, TabFilter, TabFilters } from "../../layouts";
import { useAllProposals, useTabFilters } from "../../hooks";
import { ProposalStatus } from "../../store/governanceSlice";
import { ProposalCard } from "./ProposalCard";
import { useInput } from "../../hooks/useInput";
import { FormattedProposal } from "./types";

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
  const {
    data: proposals,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useAllProposals({
    titleFilter: proposalTitleFilter,
    statusFilters: proposalTabFilters.at(tabIndex)?.filters,
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
  const hashScanLink = createHashScanLink(locationState?.proposalTransactionId);
  const handleClickNotificationCloseButton = () => setIsNotificationVisible(false);
  const handleClickNewProposalButton = () => navigate("/governance/select-proposal-type");

  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={8} width="100%">
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
      <GridItem colSpan={1}>
        <Flex direction="row">
          <Text flex="4" textStyle="h1">
            Governance
          </Text>
          <Button
            flex="1"
            alignSelf="center"
            variant="new-proposal"
            textStyle="h3"
            data-testid="new-proposal-button"
            onClick={handleClickNewProposalButton}
          >
            New Proposal
          </Button>
        </Flex>
      </GridItem>
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
              {/* TODO: Add Filter By Date input component and functionality.
                <Input variant="filter" placeholder="Filter By Date" flex="1" minWidth="300px" />
                <Spacer margin="0.5rem" /> 
              */}
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
          cardLists={proposalTabFilters.map(() => (
            <CardList error={error} isSuccess={isSuccess} isLoading={isLoading} isError={isError}>
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
  );
};
