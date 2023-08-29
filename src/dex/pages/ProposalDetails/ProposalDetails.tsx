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
  CardBody,
  Tag as ChakraTag,
} from "@chakra-ui/react";
import { isNil } from "ramda";
import { Link as ReachLink, useParams } from "react-router-dom";
import {
  Color,
  CompletedStepIcon,
  CancelledStepIcon,
  CircleMinusIcon,
  HorizontalStackBarChart,
  LoadingDialog,
  Metrics,
  NotficationTypes,
  Notification,
  Tag,
  DisplayHTMLContent,
  Stepper,
} from "@shared/ui-kit";
import { ProposalState } from "../../store/governanceSlice";
import { useProposalDetails } from "./useProposalDetails";
import { ProposalDetailsControls } from "./ProposalDetailsControls";
import { formatProposal } from "../Governance/formatter";
import { Paths } from "@dex/routes";

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

  const formattedProposal = proposal.data ? formatProposal(proposal.data) : undefined;

  if (!proposal.isLoading && isNil(proposal)) {
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
      <Grid
        templateColumns="repeat(4, 1fr)"
        gap="4"
        width="100%"
        minHeight="500px"
        paddingTop="1.5rem"
        paddingLeft="5rem"
        paddingRight="5rem"
      >
        <GridItem colSpan={3}>
          <Flex direction="column" gap={10} height="100%">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReachLink} to={Paths.Governance.absolute}>
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
                  {formattedProposal?.title}
                </Text>
              </Skeleton>
              <Spacer padding="0.25rem" />
              <Flex direction="row" alignItems="flex-end">
                <Text alignSelf="center" textStyle="b2" paddingRight="0.25rem">
                  Type:
                </Text>
                <Tag label={formattedProposal?.type} />
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
                    <Text textDecoration="underline">{formattedProposal?.author}</Text>
                    <ExternalLinkIcon margin="0rem 0.125rem" />
                  </Link>
                </Skeleton>
              </Flex>
            </Box>
            {formattedProposal?.state === ProposalState.Executed && (
              /** TODO: Update to use Tag from dex-ui-components */
              <ChakraTag textStyle="b3" size="sm" bg={Color.Green_01_Opaque} padding="0.3rem" width="fit-content">
                {ProposalState.Executed}
              </ChakraTag>
            )}
            <Box height="fit-content" width="80%">
              <Text textStyle="h3">Description</Text>
              <Spacer padding="0.25rem" />
              <SkeletonText speed={0.4} fadeDuration={0} noOfLines={12} isLoaded={!proposal.isLoading}>
                <DisplayHTMLContent value={formattedProposal?.description ?? ""} />
              </SkeletonText>
            </Box>
            <Flex gap="4" direction="column" width="80%">
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
                {proposalStatus && <Stepper states={proposalStatus} />}
              </CardBody>
            </Card>
            <Card
              bg={Color.White_01}
              border={`0.25px solid ${Color.Grey_01}`}
              boxShadow={"0px 4px 15px rgba(0, 0, 0, 0.15)"}
              borderRadius="2px"
              alignContent="center"
            >
              <CardBody>
                <Flex direction="column" gap="7">
                  <Text textStyle="h3">Votes</Text>
                  <Flex padding="0.8rem" direction="column" gap="4">
                    <HorizontalStackBarChart
                      quorum={formattedProposal?.votes.quorum}
                      data={[
                        { value: formattedProposal?.votes.yes ?? 0, bg: Color.Blue_01 },
                        { value: formattedProposal?.votes.no ?? 0, bg: Color.Red_03 },
                        { value: formattedProposal?.votes.abstain ?? 0, bg: Color.Grey_03 },
                        { value: formattedProposal?.votes.remaining ?? 0, bg: Color.Grey_01 },
                      ]}
                    />
                    {Number(formattedProposal?.votes.yes) < Number(formattedProposal?.votes.quorum) ? (
                      <Text textStyle="h4">Quorum Not Met</Text>
                    ) : (
                      <></>
                    )}
                    <Box width="100%">
                      <Metrics
                        rows={4}
                        data={[
                          {
                            label: "Yes",
                            value: formattedProposal?.votes.yes ?? 0,
                            icon: <CompletedStepIcon />,
                          },
                          {
                            label: "No",
                            value: formattedProposal?.votes.no ?? 0,
                            icon: <CancelledStepIcon color={Color.Red_03} boxSize="7" />,
                          },
                          {
                            label: "Abstain",
                            value: formattedProposal?.votes.abstain ?? 0,
                            icon: <CircleMinusIcon fill={Color.Black_01} fillOpacity="0.54" />,
                          },
                        ]}
                      />
                    </Box>
                  </Flex>
                </Flex>
              </CardBody>
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
