import { ExternalLinkIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Link,
  Card,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  Box,
  Spacer,
  Skeleton,
  SkeletonText,
  Tag,
  CardBody,
} from "@chakra-ui/react";
import { isNil } from "ramda";
import { Link as ReachLink, useParams } from "react-router-dom";
import {
  Color,
  HorizontalStackBarChart,
  LoadingDialog,
  Metrics,
  NotficationTypes,
  Notification,
} from "../../../dex-ui-components";
import { ProposalState } from "../../store/governanceSlice";
import { useProposalDetails } from "./useProposalDetails";
import { DisplayHTMLContent } from "../../../dex-ui-components/base/Inputs/DisplayHTMLContent";
import { ProposalDetailsControls } from "./ProposalDetailsControls";
import { StepperUI } from "../../../dex-ui-components/base/Stepper";

export const ProposalDetails = () => {
  const { id } = useParams();
  const proposalDetails = useProposalDetails(id);
  const {
    proposal,
    castVote,
    cancelProposal,
    executeProposal,
    isNotificationVisible,
    successMessage,
    hashScanTransactionLink,
    hashScanAccountLink,
    isLoadingDialogOpen,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    proposalStatus,
  } = proposalDetails;

  if (!proposal.isLoading && isNil(proposal.data)) {
    return <span>{`Proposal with id: ${id} not found.`}</span>;
  }

  if (proposal.isError) {
    return <span>Error: {proposal.error.message}</span>;
  }

  function resetServerState() {
    castVote.reset();
    executeProposal.reset();
    cancelProposal.reset();
  }

  function handleErrorDialogDismissButtonClicked() {
    resetServerState();
  }

  function handleNotificationCloseButtonClicked() {
    resetServerState();
  }

  function onViewDiscussionLinkTap() {
    if (proposal.data?.link) {
      window.open(proposal.data?.link);
    }
  }

  return (
    <>
      <Grid templateColumns="repeat(4, 1fr)" gap="4" width="100%" minHeight="500px">
        <GridItem colSpan={3}>
          <Flex direction="column" gap={10} height="100%">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReachLink} to="/governance">
                  <Text textStyle="link">{"< Governance"}</Text>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Notification
              type={NotficationTypes.SUCCESS}
              /** TODO: Add logic to display what type of vote the user casted. */
              message={successMessage}
              isLinkShown={true}
              linkText="View in HashScan"
              linkRef={hashScanTransactionLink}
              isCloseButtonShown={true}
              isVisible={isNotificationVisible}
              handleClickClose={handleNotificationCloseButtonClicked}
            />
            <Box>
              <Skeleton speed={0.4} fadeDuration={0} width="fit-content" isLoaded={!proposal.isLoading}>
                <Text textStyle="h2" paddingRight="0.25rem">
                  {proposal.data?.title}
                </Text>
              </Skeleton>
              <Spacer padding="0.25rem" />
              <Flex direction="row" alignItems="flex-end">
                <Text alignSelf="center" textStyle="b2" paddingRight="0.25rem">
                  Type:
                </Text>
                <Tag textStyle="b3" size="sm" padding="0.3rem">
                  {proposal.data?.type}
                </Tag>
              </Flex>
              <Spacer padding="0.25rem" />
              <Flex flexWrap="wrap" width="100%">
                <Text alignSelf="center" textStyle="b2">
                  Authored by &nbsp;
                </Text>
                <Skeleton speed={0.4} fadeDuration={0} isLoaded={!proposal.isLoading}>
                  <Link
                    width="fit-content"
                    display="flex"
                    alignItems="center"
                    color="#0180FF"
                    href={hashScanAccountLink}
                    isExternal
                  >
                    <Text textDecoration="underline">{proposal.data?.author}</Text>
                    <ExternalLinkIcon margin="0rem 0.125rem" />
                  </Link>
                </Skeleton>
              </Flex>
            </Box>
            {proposal.data?.state === ProposalState.Executed && (
              <Tag textStyle="b3" size="sm" bg={Color.Green_01_Opaque} padding="0.3rem" width="fit-content">
                {ProposalState.Executed}
              </Tag>
            )}
            <Box flexGrow="1">
              <Text textStyle="h3">Description</Text>
              <Spacer padding="0.25rem" />
              <SkeletonText speed={0.4} fadeDuration={0} noOfLines={12} isLoaded={!proposal.isLoading}>
                <DisplayHTMLContent value={proposal.data?.description ?? ""} />
              </SkeletonText>
            </Box>
            <Flex gap="4" direction="column">
              <ProposalDetailsControls proposalDetails={proposalDetails} resetServerState={resetServerState} />
            </Flex>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction="column" gap="2">
            <Button variant="secondary" onClick={onViewDiscussionLinkTap}>
              View Discussion
            </Button>
            <Card
              bg={Color.White_01}
              border={`0.25px solid ${Color.Grey_01}`}
              boxShadow={"0px 4px 15px rgba(0, 0, 0, 0.15)"}
              borderRadius="2px"
            >
              <CardBody>
                <Text textStyle="h3">Status</Text>
                {proposalStatus && <StepperUI states={proposalStatus} />}
              </CardBody>
            </Card>
            <Card
              bg={Color.White_01}
              border={`0.25px solid ${Color.Grey_01}`}
              borderRadius="2px"
              padding="0.75rem"
              boxShadow="none"
            >
              <Flex direction="column" gap="4">
                <Text textStyle="h3">Votes</Text>
                <Spacer padding="0.5rem 0" />
                <HorizontalStackBarChart
                  quorum={Number(proposal.data?.votes.quorum)}
                  data={[
                    { value: proposal.data?.votes.yes ?? 0, bg: Color.Green_01 },
                    { value: proposal.data?.votes.no ?? 0, bg: Color.Red_01 },
                    { value: proposal.data?.votes.abstain ?? 0, bg: Color.Blue_02 },
                    { value: proposal.data?.votes.remaining ?? 0, bg: Color.Grey_01 },
                  ]}
                />
                {Number(proposal.data?.votes.yes) < Number(proposal.data?.votes.quorum) ? (
                  <Text textStyle="h4">Quorum Not Met</Text>
                ) : (
                  <></>
                )}
                <Box width="90%">
                  <Metrics
                    rows={2}
                    data={[
                      { label: "Yes", value: proposal.data?.votes.yes ?? 0, color: Color.Green_01 },
                      { label: "No", value: proposal.data?.votes.no ?? 0, color: Color.Red_01 },
                      { label: "Abstain", value: proposal.data?.votes.abstain ?? 0, color: Color.Blue_02 },
                      { label: "Remain", value: proposal.data?.votes.remaining ?? 0, color: Color.Grey_01 },
                    ]}
                  />
                </Box>
              </Flex>
            </Card>
          </Flex>
        </GridItem>
      </Grid>
      <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        message={errorDialogMessage}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: handleErrorDialogDismissButtonClicked,
        }}
      />
    </>
  );
};
